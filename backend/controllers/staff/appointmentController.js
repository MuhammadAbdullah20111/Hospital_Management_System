import Appointment from '../../models/Appointment.js';
import ApiResponse from '../../utils/ApiResponse.js';
import prisma from '../../config/prismaClient.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createAppointment = asyncHandler(async (req, res) => {
    const { date, time, reason, patientId, doctorId } = req.body;

    // Ensure date is a valid DateTime
    const appointmentDate = new Date(date);
    
    // Fetch doctor to check consultationDuration
    const doctor = await prisma.staff.findUnique({
        where: { id: parseInt(doctorId) },
        select: { consultationDuration: true }
    });

    if (!doctor) {
        return ApiResponse.error(res, 'Doctor not found', 404);
    }

    const duration = doctor.consultationDuration || 15;
    const requestedTimeParts = time.split(':');
    const requestedMinutes = parseInt(requestedTimeParts[0]) * 60 + parseInt(requestedTimeParts[1]);

    // Fetch existing appointments for the same date and doctor
    const existingAppointments = await prisma.appointment.findMany({
        where: {
            doctorId: parseInt(doctorId),
            date: {
                gte: new Date(appointmentDate.setHours(0,0,0,0)),
                lte: new Date(appointmentDate.setHours(23,59,59,999))
            },
            status: {
                not: 'CANCELLED'
            }
        }
    });

    // Check for overlap
    for (let appt of existingAppointments) {
        const apptTimeParts = appt.time.split(':');
        const apptMinutes = parseInt(apptTimeParts[0]) * 60 + parseInt(apptTimeParts[1]);
        
        // If requested time falls within an existing appointment's duration
        if (requestedMinutes >= apptMinutes && requestedMinutes < apptMinutes + duration) {
            return ApiResponse.error(res, 'This time slot overlaps with an existing appointment', 400);
        }
        // If an existing appointment falls within the requested time's duration
        if (apptMinutes >= requestedMinutes && apptMinutes < requestedMinutes + duration) {
            return ApiResponse.error(res, 'This time slot overlaps with an existing appointment', 400);
        }
    }

    // Fetch existing tokens for the same date and department
    const existingTokens = await prisma.queueToken.findMany({
        where: {
            department: 'DOCTOR',
            date: {
                gte: new Date(appointmentDate.setHours(0,0,0,0)),
                lte: new Date(appointmentDate.setHours(23,59,59,999))
            }
        }
    });

    // Generate tokenNumber (next available number for this date and department)
    const maxToken = existingTokens.reduce((max, token) => Math.max(max, token.tokenNumber || 0), 0);
    const tokenNumber = maxToken + 1;

    const newAppointment = await Appointment.create({
        date: new Date(date),
        time,
        reason,
        status: 'PENDING',
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        createdById: req.user.id,
        queueToken: {
            create: {
                tokenNumber,
                department: 'DOCTOR',
                status: 'WAITING',
                date: new Date(date)
            }
        }
    });

    return ApiResponse.success(res, 'Appointment created successfully', {
        appointment: newAppointment,
    }, 201);
});

export const getAllAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.findAll();
    return ApiResponse.success(res, 'Appointments fetched successfully', {
        appointments,
    });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(Number(id));

    if (!appointment) {
        return ApiResponse.error(res, 'Appointment not found', 404);
    }

    return ApiResponse.success(res, 'Appointment details fetched successfully', {
        appointment,
    });
});

export const updateAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAppointment = await Appointment.update(Number(id), updateData);

    return ApiResponse.success(res, 'Appointment updated successfully', {
        appointment: updatedAppointment,
    });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Appointment.delete(Number(id));
    return ApiResponse.success(res, 'Appointment deleted successfully');
});
