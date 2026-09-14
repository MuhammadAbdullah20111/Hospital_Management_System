import Patient from '../../models/Patient.js';
import ApiResponse from '../../utils/ApiResponse.js';
import MrNumberService from '../../services/MrNumberService.js';
import asyncHandler from '../../utils/asyncHandler.js';
import HL7Facade from '../../services/hl7/HL7Facade.js';

export const createPatient = asyncHandler(async (req, res) => {
    const { name, email, phoneNumber, age, gender, address, cnic } = req.body;

    const mrNumber = await MrNumberService.generateMrNumber();

    const newPatient = await Patient.create({
        name,
        email,
        phoneNumber,
        cnic,
        age,
        gender,
        address,
        mrNumber,
        createdById: req.user?.role !== 'ADMIN' ? req.user?.id : undefined
    });

    // Fire HL7 ADT Message asynchronously
    try {
        const hl7Data = {
            patientId: newPatient.mrNumber,
            firstName: newPatient.name.split(' ')[0] || '',
            lastName: newPatient.name.split(' ').slice(1).join(' ') || '',
            dateOfBirth: newPatient.age ? (new Date().getFullYear() - newPatient.age).toString() + '0101' : '19900101', 
            gender: newPatient.gender === 'Male' ? 'M' : newPatient.gender === 'Female' ? 'F' : 'U'
        };
        // Do not await, fire and forget to prevent blocking the response
        HL7Facade.sendPatientAdmission(hl7Data).catch(err => console.error('HL7 Background Send Error:', err));
    } catch (hl7Err) {
        console.error('HL7 ADT Trigger Error:', hl7Err);
    }

    return ApiResponse.success(res, 'Patient created successfully', {
        patient: newPatient,
    }, 201);
});

export const getAllPatients = asyncHandler(async (req, res) => {
    const { unadmittedOnly } = req.query;
    let query = {};
    
    if (unadmittedOnly === 'true') {
        query = {
            bedAssignments: {
                none: {
                    actualDischargeAt: null
                }
            }
        };
    }

    const patients = await Patient.findAll(query);
    return ApiResponse.success(res, 'Patients fetched successfully', {
        patients,
    });
});

export const getPatientById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const patient = await Patient.findById(Number(id));

    if (!patient) {
        return ApiResponse.error(res, 'Patient not found', 404);
    }

    return ApiResponse.success(res, 'Patient details fetched successfully', {
        patient,
    });
});

export const updatePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findById(Number(id));
    if (!patient) {
        return ApiResponse.error(res, 'Patient not found', 404);
    }

    const updatedPatient = await Patient.update(Number(id), updateData);

    return ApiResponse.success(res, 'Patient updated successfully', {
        patient: updatedPatient,
    });
});

export const deletePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const patient = await Patient.findById(Number(id));
    if (!patient) {
        return ApiResponse.error(res, 'Patient not found', 404);
    }

    await Patient.delete(Number(id));

    return ApiResponse.success(res, 'Patient deleted successfully');
});

export const getNextMrNumber = asyncHandler(async (req, res) => {
    const nextMrNumber = await MrNumberService.getPreviewMrNumber();
    return ApiResponse.success(res, 'Next MR Number fetched successfully', {
        nextMrNumber,
    });
});
