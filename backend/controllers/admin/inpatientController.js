import prisma from '../../config/prismaClient.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getInpatientSummary = asyncHandler(async (req, res) => {
  const stats = await prisma.bed.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });

  const summary = {
    totalBeds: 0,
    AVAILABLE: 0,
    OCCUPIED: 0,
    MAINTENANCE: 0,
    CLEANING: 0,
    RESERVED: 0
  };

  stats.forEach(stat => {
    summary[stat.status] = stat._count.id;
    summary.totalBeds += stat._count.id;
  });

  const activeAdmissions = await prisma.bedAssignment.count({
    where: { actualDischargeAt: null }
  });

  return ApiResponse.success(res, 'Inpatient summary fetched successfully', {
    summary,
    activeAdmissions
  });
});

export const getBedOccupancy = asyncHandler(async (req, res) => {
  const wards = await prisma.ward.findMany({
    include: {
      rooms: {
        include: {
          beds: {
            include: {
              room: {
                include: { category: true }
              },
              assignments: {
                where: { actualDischargeAt: null },
                include: {
                  patient: {
                    select: {
                      name: true,
                      mrNumber: true,
                      gender: true,
                      age: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      beds: {
        where: { roomId: null }, // Beds directly in ward
        include: {
          room: {
            include: { category: true }
          },
          assignments: {
            where: { actualDischargeAt: null },
            include: {
              patient: {
                select: {
                  name: true,
                  mrNumber: true,
                  gender: true,
                  age: true
                }
              }
            }
          }
        }
      }
    }
  });

  return ApiResponse.success(res, 'Bed occupancy fetched successfully', { wards });
});
