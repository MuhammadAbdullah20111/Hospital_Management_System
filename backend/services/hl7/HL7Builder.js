import hl7 from 'simple-hl7';

/**
 * Subsystem: Builds HL7 v2.x messages from JavaScript objects.
 */
export class HL7Builder {
  /**
   * Formats a JS Date to HL7 YYYYMMDDHHMMSS format.
   */
  static formatHL7Date(date = new Date()) {
    const pad = (n) => n < 10 ? '0' + n : n;
    return date.getFullYear().toString() +
           pad(date.getMonth() + 1) +
           pad(date.getDate()) +
           pad(date.getHours()) +
           pad(date.getMinutes()) +
           pad(date.getSeconds());
  }

  /**
   * Creates a base HL7 message with a pre-configured MSH segment.
   * @param {string} sendingApp 
   * @param {string} sendingFacility 
   * @param {string} receivingApp 
   * @param {string} receivingFacility 
   * @param {string} messageType - e.g., 'ADT^A01'
   * @returns {Object} simple-hl7 Message object
   */
  static createBaseMessage(sendingApp = 'MYAPP', sendingFacility = 'MYFACILITY', receivingApp = 'RECVAPP', receivingFacility = 'RECVFACILITY', messageType = 'ADT^A01') {
    const msg = new hl7.Message(
      sendingApp,
      sendingFacility,
      receivingApp,
      receivingFacility,
      '', // security
      messageType,
      this.generateMessageControlId(),
      'P',
      '2.4'
    );
    // Overwrite the MSH-7 Date/Time with a properly formatted date string
    msg.header.setField(7, this.formatHL7Date());
    return msg;
  }

  /**
   * Adds a PID (Patient Identification) segment.
   * @param {Object} message 
   * @param {Object} patientData 
   */
  static addPIDSegment(message, patientData) {
    message.addSegment('PID',
      '1', // Set ID
      '',  // External ID
      patientData.patientId || '', // Internal ID
      '', 
      `${patientData.lastName || ''}^${patientData.firstName || ''}`, 
      '', 
      patientData.dateOfBirth || '', // YYYYMMDD format expected
      patientData.gender || 'U' // M, F, O, U
    );
  }

  /**
   * Adds an OBR (Observation Request) segment.
   * @param {Object} message 
   * @param {Object} orderData 
   */
  static addOBRSegment(message, orderData) {
    message.addSegment('OBR',
      '1', // Set ID
      orderData.placerOrderNumber || '',
      orderData.fillerOrderNumber || '',
      orderData.universalServiceId || '' // e.g., '88304^SURGICAL PATHOLOGY'
    );
  }

  /**
   * Adds an OBX (Observation/Result) segment.
   * @param {Object} message 
   * @param {Object} resultData 
   */
  static addOBXSegment(message, resultData) {
    message.addSegment('OBX',
      resultData.setId || '1',
      resultData.valueType || 'ST',
      resultData.observationId || '', // e.g., 'WBC^White Blood Count'
      '',
      resultData.observationValue || '',
      resultData.units || '',
      resultData.referenceRange || '',
      resultData.abnormalFlags || ''
    );
  }

  /**
   * Helper to generate a unique Message Control ID.
   */
  static generateMessageControlId() {
    return 'MSG' + Date.now();
  }
}
