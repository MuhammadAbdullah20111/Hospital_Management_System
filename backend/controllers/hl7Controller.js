import prisma from '../config/prismaClient.js';
import ApiResponse from '../utils/ApiResponse.js';
import HL7Facade from '../services/hl7/HL7Facade.js';

/**
 * Controller to handle HL7 integrations with real database data.
 */
export const sendPatientAdmitHL7 = async (req, res, next) => {
  try {
    const { patientId, endpointUrl } = req.body;

    if (!patientId || !endpointUrl) {
      return ApiResponse.badRequest(res, 'patientId and endpointUrl are required');
    }

    // 1. Fetch real patient data from Prisma
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) }
    });

    if (!patient) {
      return ApiResponse.notFound(res, 'Patient not found');
    }

    // 2. Map Prisma data to the expected HL7 format
    const hl7PatientData = {
      patientId: patient.mrNumber, // Using MR Number as the primary ID
      firstName: patient.name.split(' ')[0] || '',
      lastName: patient.name.split(' ').slice(1).join(' ') || '',
      // Formatting date (e.g., from age or createdAt if dob is missing, here we fake it if missing)
      dateOfBirth: patient.age ? (new Date().getFullYear() - patient.age).toString() + '0101' : '19900101', 
      gender: patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'U'
    };

    // 3. Send using the Facade
    const response = await HL7Facade.sendPatientAdmission(hl7PatientData, endpointUrl);

    return ApiResponse.success(res, 'HL7 ADT Message Sent Successfully', {
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    next(error);
  }
};

export const receiveHL7 = async (req, res, next) => {
  let logStatus = 'PROCESSED';
  let errorDetails = null;
  let msgType = 'UNKNOWN';
  let msgControlId = 'UNKNOWN';
  const rawHl7 = req.body;

  try {
    if (!rawHl7 || typeof rawHl7 !== 'string') {
        return ApiResponse.badRequest(res, 'Invalid HL7 payload. Expected raw string text.');
    }

    // 1. Parse using Facade
    const parsedMessage = HL7Facade.parseMessage(rawHl7);
    msgType = parsedMessage.header.getField(9) || 'UNKNOWN';
    msgControlId = parsedMessage.header.getField(10) || 'UNKNOWN';

    // 2. Process based on Message Type
    if (msgType.startsWith('ORU')) {
      const obr = parsedMessage.getSegment('OBR');
      if (!obr) throw new Error("ORU message missing OBR segment");

      // Extract filler order number (OBR-3)
      const fillerOrderNumber = obr.getField(3); 
      if (!fillerOrderNumber) throw new Error("Missing Filler Order Number in OBR-3");

      // Find all OBX segments (simple-hl7 returns an array if multiple, but wait: `getSegments` gets all)
      const obxSegments = parsedMessage.getSegments('OBX');
      
      let finalResultString = '';
      let shouldUpdate = false;

      obxSegments.forEach(obx => {
        const observationId = obx.getField(3); // e.g., Sodium
        const observationValue = obx.getField(5);
        const units = obx.getField(6);
        const status = obx.getField(11);

        // Check if status is Final (F), Corrected (C), or Replaced (R)
        if (['F', 'C', 'R'].includes(status)) {
          shouldUpdate = true;
          finalResultString += `${observationId}: ${observationValue} ${units}\n`;
        } else if (status === 'X') {
          // Cancelled
          shouldUpdate = true;
          finalResultString += `${observationId}: CANCELLED\n`;
        }
      });

      if (shouldUpdate) {
        // Find and update the LabTest
        const labTest = await prisma.labTest.findUnique({
          where: { fillerOrderNumber: fillerOrderNumber }
        });

        if (labTest) {
          await prisma.labTest.update({
            where: { id: labTest.id },
            data: { result: finalResultString.trim() }
          });
        } else {
          throw new Error(`LabTest with fillerOrderNumber ${fillerOrderNumber} not found.`);
        }
      }
    }
    
    return ApiResponse.success(res, 'HL7 Message Received and Processed');
  } catch (error) {
    logStatus = 'ERROR';
    errorDetails = error.message;
    console.error("HL7 Receive Error:", error);
    next(error);
  } finally {
    if (rawHl7 && typeof rawHl7 === 'string') {
      try {
        await prisma.hl7Log.create({
          data: {
            messageId: msgControlId,
            type: msgType,
            direction: 'INBOUND',
            rawMessage: rawHl7,
            status: logStatus,
            errorDetails: errorDetails
          }
        });
      } catch (dbErr) {
        console.error("Failed to write to Hl7Log:", dbErr);
      }
    }
  }
};

export const sendOrderHL7 = async (req, res, next) => {
  try {
    const { patientId, labTestId, endpointUrl } = req.body;

    if (!patientId || !labTestId || !endpointUrl) {
      return ApiResponse.badRequest(res, 'patientId, labTestId, and endpointUrl are required');
    }

    const patient = await prisma.patient.findUnique({ where: { id: parseInt(patientId) } });
    const labTest = await prisma.labTest.findUnique({ 
        where: { id: parseInt(labTestId) },
        include: { test: true }
    });

    if (!patient || !labTest) return ApiResponse.notFound(res, 'Patient or LabTest not found');

    const hl7PatientData = {
      patientId: patient.mrNumber,
      firstName: patient.name.split(' ')[0] || '',
      lastName: patient.name.split(' ').slice(1).join(' ') || '',
      dateOfBirth: patient.age ? (new Date().getFullYear() - patient.age).toString() + '0101' : '19900101', 
      gender: patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'U'
    };

    const orderData = {
      placerOrderNumber: `ORD-${labTest.id}`,
      fillerOrderNumber: `FIL-${labTest.id}`,
      universalServiceId: labTest.test ? `${labTest.test.id}^${labTest.test.name}` : `${labTest.id}^${labTest.testName}`
    };

    const response = await HL7Facade.sendOrderMessage(hl7PatientData, orderData, endpointUrl);
    return ApiResponse.success(res, 'HL7 ORM Message Sent Successfully', { status: response.status });
  } catch (error) {
    next(error);
  }
};

export const sendResultHL7 = async (req, res, next) => {
  try {
    const { patientId, labTestId, endpointUrl } = req.body;

    if (!patientId || !labTestId || !endpointUrl) {
      return ApiResponse.badRequest(res, 'patientId, labTestId, and endpointUrl are required');
    }

    const patient = await prisma.patient.findUnique({ where: { id: parseInt(patientId) } });
    const labTest = await prisma.labTest.findUnique({ 
        where: { id: parseInt(labTestId) },
        include: { test: true }
    });

    if (!patient || !labTest) return ApiResponse.notFound(res, 'Patient or LabTest not found');

    const hl7PatientData = {
      patientId: patient.mrNumber,
      firstName: patient.name.split(' ')[0] || '',
      lastName: patient.name.split(' ').slice(1).join(' ') || '',
      dateOfBirth: patient.age ? (new Date().getFullYear() - patient.age).toString() + '0101' : '19900101', 
      gender: patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'U'
    };

    const resultData = {
      setId: '1',
      serviceId: labTest.test ? `${labTest.test.id}^${labTest.test.name}` : `${labTest.id}^${labTest.testName}`,
      valueType: 'ST',
      observationId: 'RESULT^Lab Result',
      observationValue: labTest.result || 'Pending',
      units: '',
      referenceRange: '',
      abnormalFlags: 'N'
    };

    const response = await HL7Facade.sendObservationResult(hl7PatientData, resultData, endpointUrl);
    return ApiResponse.success(res, 'HL7 ORU Message Sent Successfully', { status: response.status });
  } catch (error) {
    next(error);
  }
};
