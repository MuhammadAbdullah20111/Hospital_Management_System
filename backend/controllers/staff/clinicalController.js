import Prescription from '../../models/Prescription.js';
import Appointment from '../../models/Appointment.js';
import Patient from '../../models/Patient.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createPrescription = asyncHandler(async (req, res) => {
    const { appointmentId, diagnosis, prescriptionContent, nextFollowUp } = req.body;
    const doctorId = req.user.id; // From authenticate middleware
    const role = req.user.role?.name?.toUpperCase();

    // 1. Verify Appointment existence and assignment
    const appointment = await Appointment.findById(Number(appointmentId));
    if (!appointment) {
        return ApiResponse.error(res, 'Appointment not found', 404);
    }

    // 2. Authorization: Doctor only for their own appointment.
    if (role === 'DOCTOR' && Number(appointment.doctorId) !== Number(doctorId)) {
        return ApiResponse.error(res, 'Unauthorized: This appointment is assigned to another doctor', 403);
    }

    // 3. Check if Prescription already exists
    const existingPrescription = await Prescription.findByAppointmentId(Number(appointmentId));
    let savedPrescription;

    if (existingPrescription) {
        savedPrescription = await Prescription.update(existingPrescription.id, {
            diagnosis,
            prescriptionContent,
            nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null
        });
    } else {
        savedPrescription = await Prescription.create({
            diagnosis,
            prescriptionContent,
            nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
            appointmentId: Number(appointmentId),
            patientId: Number(appointment.patientId),
            doctorId: Number(appointment.doctorId)
        });
    }

    // 4. Update Appointment status to COMPLETED
    await Appointment.update(Number(appointmentId), { status: 'COMPLETED' });

    return ApiResponse.success(res, 'Prescription saved and appointment completed', {
        prescription: savedPrescription
    }, existingPrescription ? 200 : 201);
});

export const getPatientHistory = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const doctorId = req.user.id;
    const role = req.user.role?.name?.toUpperCase();

    // 1. Verify Patient
    const patient = await Patient.findById(Number(patientId));
    if (!patient) {
        return ApiResponse.error(res, 'Patient not found', 404);
    }

    // 2. Fetch history (Appointments and Prescriptions)
    const appointments = await Appointment.findAll({ patientId: Number(patientId) });
    const prescriptions = await Prescription.findByPatientId(Number(patientId));

    return ApiResponse.success(res, 'Patient history fetched successfully', {
        history: {
            appointments,
            prescriptions
        }
    });
});

export const getPrescriptionByAppointmentId = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const prescription = await Prescription.findByAppointmentId(Number(appointmentId));
    
    if (!prescription) {
        return ApiResponse.error(res, 'No prescription found for this appointment', 404);
    }

    return ApiResponse.success(res, 'Prescription details fetched successfully', {
        prescription
    });
});
