import HL7Facade from './services/hl7/HL7Facade.js';

async function runTest() {
  try {
    console.log("=== Testing HL7 Builder ===");
    const patientData = {
      patientId: '12345',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '19800101',
      gender: 'M'
    };
    
    // Test creating a message but just print it instead of sending
    const message = (await import('./services/hl7/HL7Builder.js')).HL7Builder.createBaseMessage('APP', 'FAC', 'REC', 'RECFAC', 'ADT^A01');
    (await import('./services/hl7/HL7Builder.js')).HL7Builder.addPIDSegment(message, patientData);
    
    const rawHl7 = message.toString();
    console.log("Generated HL7 String:");
    console.log(rawHl7);
    console.log("\n");

    console.log("=== Testing HL7 Parser ===");
    const parsedMessage = HL7Facade.parseMessage(rawHl7);
    const extractedInfo = HL7Facade.extractPatientInfo(parsedMessage);
    
    console.log("Extracted Patient Info from parsed message:");
    console.log(extractedInfo);
    console.log("\n");

  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
