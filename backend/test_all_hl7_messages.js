import HL7Facade from './services/hl7/HL7Facade.js';
import { HL7Builder } from './services/hl7/HL7Builder.js';

async function runTests() {
  console.log("=========================================");
  console.log("   HL7 Facade Tests (ADT, ORM, ORU)");
  console.log("=========================================\n");

  const patientData = {
    patientId: 'PAT-10023',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '19851025',
    gender: 'F'
  };

  try {
    // 1. Test ADT (Admit/Discharge/Transfer)
    console.log("--- 1. Testing ADT^A01 (Patient Admission) ---");
    const adtMessage = HL7Builder.createBaseMessage('APP', 'FAC', 'REC', 'RECFAC', 'ADT^A01');
    HL7Builder.addPIDSegment(adtMessage, patientData);
    const adtRaw = adtMessage.toString();
    console.log(adtRaw);
    console.log("\nParsed Patient Info from ADT:");
    console.log(HL7Facade.extractPatientInfo(HL7Facade.parseMessage(adtRaw)));
    console.log("\n");

    // 2. Test ORM (Order Message)
    console.log("--- 2. Testing ORM^O01 (Order) ---");
    const orderData = {
      placerOrderNumber: 'ORD-556677',
      fillerOrderNumber: 'FIL-998877',
      universalServiceId: '88304^SURGICAL PATHOLOGY'
    };
    const ormMessage = HL7Builder.createBaseMessage('APP', 'FAC', 'REC', 'RECFAC', 'ORM^O01');
    HL7Builder.addPIDSegment(ormMessage, patientData);
    HL7Builder.addOBRSegment(ormMessage, orderData);
    console.log(ormMessage.toString());
    console.log("\n");

    // 3. Test ORU (Observation Result)
    console.log("--- 3. Testing ORU^R01 (Observation Result) ---");
    const resultData = {
      setId: '1',
      serviceId: '88304^SURGICAL PATHOLOGY', // Passed to OBR
      valueType: 'NM', // Numeric
      observationId: 'WBC^White Blood Count',
      observationValue: '7.5',
      units: '10*3/uL',
      referenceRange: '4.5-11.0',
      abnormalFlags: 'N' // Normal
    };
    const oruMessage = HL7Builder.createBaseMessage('APP', 'FAC', 'REC', 'RECFAC', 'ORU^R01');
    HL7Builder.addPIDSegment(oruMessage, patientData);
    HL7Builder.addOBRSegment(oruMessage, { universalServiceId: resultData.serviceId });
    HL7Builder.addOBXSegment(oruMessage, resultData);
    console.log(oruMessage.toString());
    console.log("\n");

  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTests();
