import Bed from '../../models/Bed.js';
import BedAssignment from '../../models/BedAssignment.js';
import ApiResponse from '../../utils/ApiResponse.js';
import prisma from '../../config/prismaClient.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createBed = asyncHandler(async (req, res) => {
  const { bedNumber, wardId, roomId } = req.body;
  // 1. Check if bedNumber already exists
  const existingBed = await prisma.bed.findFirst({
    where: { bedNumber, wardId: parseInt(wardId) }
  });
  if (existingBed) {
    return ApiResponse.error(res, `Bed number "${bedNumber}" already exists in this ward`, 400);
  }

  // 2. Verify roomId belongs to wardId if provided and check capacity
  if (roomId) {
    const room = await prisma.room.findUnique({ 
      where: { id: parseInt(roomId) },
      include: { _count: { select: { beds: true } } }
    });
    
    if (!room || room.wardId !== parseInt(wardId)) {
      return ApiResponse.error(res, 'The selected room does not belong to the selected ward', 400);
    }

    if (room.capacity && room._count.beds >= room.capacity) {
      return ApiResponse.error(res, `Room ${room.roomNumber} has reached its maximum capacity of ${room.capacity} beds`, 400);
    }
  }

  const bed = await Bed.create({
    ...req.body,
    wardId: parseInt(wardId),
    roomId: roomId ? parseInt(roomId) : null
  });
  return ApiResponse.success(res, 'Bed created successfully', { bed }, 201);
});

export const getAllBeds = asyncHandler(async (req, res) => {
  const { wardId, roomId, status } = req.query;
  const filters = {};
  if (wardId) filters.wardId = parseInt(wardId);
  if (roomId) filters.roomId = parseInt(roomId);
  if (status) filters.status = status;

  const beds = await Bed.findAll(filters);
  return ApiResponse.success(res, 'Beds fetched successfully', { beds });
});

export const getBedById = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(parseInt(req.params.id));
  if (!bed) {
    return ApiResponse.error(res, 'Bed not found', 404);
  }
  return ApiResponse.success(res, 'Bed fetched successfully', { bed });
});

export const updateBed = asyncHandler(async (req, res) => {
  const { wardId, roomId } = req.body;
  // 1. Verify roomId belongs to wardId if provided
  if (wardId && roomId) {
    const room = await prisma.room.findUnique({ where: { id: parseInt(roomId) } });
    if (!room || room.wardId !== parseInt(wardId)) {
      return ApiResponse.error(res, 'The selected room does not belong to the selected ward', 400);
    }
  }

  const bed = await Bed.update(parseInt(req.params.id), req.body);
  return ApiResponse.success(res, 'Bed updated successfully', { bed });
});

export const deleteBed = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  // 1. Check if bed is occupied
  const bed = await prisma.bed.findUnique({ where: { id } });
  if (!bed) return ApiResponse.error(res, 'Bed not found', 404);
  
  if (bed.status === 'OCCUPIED') {
    return ApiResponse.error(res, 'Cannot delete an occupied bed. Please discharge or transfer the patient first.', 400);
  }

  await Bed.delete(id);
  return ApiResponse.success(res, 'Bed deleted successfully');
});

// --- Business Logic ---

export const assignPatient = asyncHandler(async (req, res) => {
  const { patientId, bedId, expectedDischargeAt, notes } = req.body;
  const assignedBy = req.user.id;

  if (!expectedDischargeAt) {
    return ApiResponse.error(res, 'Expected discharge date is required', 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if bed is available
      const bed = await tx.bed.findUnique({ where: { id: parseInt(bedId) } });
      if (!bed || bed.status !== 'AVAILABLE') {
        throw new Error('Bed is not available');
      }

      // 2. Check if patient exists and is already assigned
      const patient = await tx.patient.findUnique({ where: { id: parseInt(patientId) } });
      if (!patient) {
        throw new Error('Patient not found');
      }

      const existingAssignment = await tx.bedAssignment.findFirst({
        where: { patientId: parseInt(patientId), actualDischargeAt: null }
      });
      if (existingAssignment) {
        throw new Error('Patient is already assigned to another bed');
      }

      // 3. Update bed status
      await tx.bed.update({
        where: { id: parseInt(bedId) },
        data: { status: 'OCCUPIED' }
      });

      // 4. Fetch daily rate from RoomCategory
      const bedWithCategory = await tx.bed.findUnique({
        where: { id: parseInt(bedId) },
        include: {
          room: {
            include: { category: true }
          }
        }
      });
      const dailyRate = bedWithCategory?.room?.category?.pricePerDay || 0;

      // 5. Create assignment
      const assignment = await tx.bedAssignment.create({
        data: {
          patientId: parseInt(patientId),
          bedId: parseInt(bedId),
          assignedBy,
          expectedDischargeAt: expectedDischargeAt ? new Date(expectedDischargeAt) : null,
          notes,
          dailyRate
        }
      });

      // 6. Create HospitalAssetRent record
      await tx.hospitalAssetRent.create({
        data: {
          patientId: parseInt(patientId),
          assetType: 'BED',
          assetId: parseInt(bedId),
          startDate: new Date(),
          ratePerDay: dailyRate,
          status: 'ACTIVE'
        }
      });

      return assignment;
    });

    return ApiResponse.success(res, 'Patient assigned to bed successfully', { assignment: result });
  } catch (error) {
    if (error.message === 'Bed is not available' || 
        error.message === 'Patient is already assigned to another bed' ||
        error.message === 'Patient not found'
    ) {
      return ApiResponse.error(res, error.message, 400);
    }
    throw error;
  }
});

export const dischargePatient = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { dischargeReason, notes } = req.body;
  const dischargedBy = req.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.bedAssignment.findUnique({ where: { id: parseInt(assignmentId) } });
      if (!assignment || assignment.actualDischargeAt) {
        throw new Error('Active assignment not found');
      }

      // 1. Update assignment
      const actualDischargeAt = new Date();
      const stayDurationMs = actualDischargeAt - new Date(assignment.assignedAt);
      const stayDays = Math.max(1, Math.ceil(stayDurationMs / (1000 * 60 * 60 * 24)));
      const totalBill = stayDays * (assignment.dailyRate || 0);

      const paymentStatus = req.body.paymentStatus || 'PENDING';
      const paymentMethod = req.body.paymentMethod || 'CASH';
      const paymentReference = req.body.paymentReference || null;

      const updatedAssignment = await tx.bedAssignment.update({
        where: { id: parseInt(assignmentId) },
        data: {
          actualDischargeAt,
          dischargeReason,
          dischargedBy,
          totalBill,
          isPaid: paymentStatus === 'PAID',
          notes: notes ? `${assignment.notes}\nDischarge Notes: ${notes}` : assignment.notes
        }
      });

      // 2. Update HospitalAssetRent
      const assetRent = await tx.hospitalAssetRent.findFirst({
        where: { 
          patientId: assignment.patientId, 
          assetType: 'BED', 
          assetId: assignment.bedId,
          status: 'ACTIVE'
        }
      });

      if (assetRent) {
        // Find the 'Bed Rent' category
        const category = await tx.transactionCategory.findUnique({ where: { name: 'Bed Rent' } });

        // Create or Update INCOME Transaction
        const existingTx = await tx.transaction.findUnique({
          where: { bedAssignmentId: assignment.id }
        });

        if (existingTx) {
          await tx.transaction.update({
            where: { id: existingTx.id },
            data: {
              amount: totalBill,
              status: paymentStatus === 'PENDING' && existingTx.status === 'PAID' ? 'PAID' : paymentStatus,
              notes: existingTx.notes + `\nDischarged. Actual stay: ${stayDays} days.`
            }
          });
        } else {
          await tx.transaction.create({
            data: {
              type: 'INCOME',
              categoryId: category?.id || 1, // Fallback to 1 if not found
              amount: totalBill,
              method: paymentMethod,
              status: paymentStatus,
              referenceNumber: paymentReference,
              patientId: assignment.patientId,
              notes: `Bed Rent for ${stayDays} days (Bed ${assignment.bedId})`,
              bedAssignmentId: assignment.id,
              assetRentId: assetRent.id
            }
          });
        }

        await tx.hospitalAssetRent.update({
          where: { id: assetRent.id },
          data: {
            endDate: actualDischargeAt,
            totalAmount: totalBill,
            status: 'COMPLETED'
          }
        });
      }

      // 3. Update bed status to CLEANING
      await tx.bed.update({
        where: { id: assignment.bedId },
        data: { status: 'CLEANING' }
      });

      return updatedAssignment;
    });

    return ApiResponse.success(res, 'Patient discharged successfully. Bed status set to CLEANING.', { assignment: result });
  } catch (error) {
    if (error.message === 'Active assignment not found') {
      return ApiResponse.error(res, error.message, 404);
    }
    throw error;
  }
});

export const transferPatient = asyncHandler(async (req, res) => {
  const { assignmentId, newBedId, notes } = req.body;
  const userId = req.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const oldAssignment = await tx.bedAssignment.findUnique({ where: { id: parseInt(assignmentId) } });
      if (!oldAssignment || oldAssignment.actualDischargeAt) {
        throw new Error('Active assignment not found');
      }

      // 1. Check if new bed is available
      const newBed = await tx.bed.findUnique({ where: { id: parseInt(newBedId) } });
      if (!newBed || newBed.status !== 'AVAILABLE') {
        throw new Error('New bed is not available');
      }

      // 2. Close old assignment
      await tx.bedAssignment.update({
        where: { id: parseInt(assignmentId) },
        data: {
          actualDischargeAt: new Date(),
          dischargeReason: 'TRANSFERRED',
          dischargedBy: userId,
          transferredToId: parseInt(newBedId),
          notes: oldAssignment.notes ? `${oldAssignment.notes}\nTransferred to Bed ${newBed.bedNumber}` : `Transferred to Bed ${newBed.bedNumber}`
        }
      });

      // 3. Set old bed to CLEANING
      await tx.bed.update({
        where: { id: oldAssignment.bedId },
        data: { status: 'CLEANING' }
      });

      // 4. Set new bed to OCCUPIED
      await tx.bed.update({
        where: { id: parseInt(newBedId) },
        data: { status: 'OCCUPIED' }
      });

      // 5. Create new assignment
      return await tx.bedAssignment.create({
        data: {
          patientId: oldAssignment.patientId,
          bedId: parseInt(newBedId),
          assignedBy: userId,
          transferredFromId: oldAssignment.bedId,
          notes: `Transferred from Bed ${oldAssignment.bedId}. ${notes || ''}`
        }
      });
    });

    return ApiResponse.success(res, 'Patient transferred successfully', { assignment: result });
  } catch (error) {
    if (error.message === 'Active assignment not found' || error.message === 'New bed is not available') {
      return ApiResponse.error(res, error.message, 400);
    }
    throw error;
  }
});

export const updateBedStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`[BedStatusUpdate] ID: ${id}, Body:`, req.body);

  const bed = await Bed.updateStatus(parseInt(id), status);
  return ApiResponse.success(res, `Bed status updated to ${status}`, { bed });
});
