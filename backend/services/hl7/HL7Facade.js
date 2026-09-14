import { HL7Builder } from './HL7Builder.js';
import { HL7Parser } from './HL7Parser.js';
import { HL7HttpTransporter } from './HL7HttpTransporter.js';

/**
 * Facade: Provides a simplified interface for HL7 operations.
 */
class HL7Facade {
  /**
   * Generates and sends an ADT (Admit, Discharge, Transfer) message.
   * @param {Object} patientData - Patient details.
   * @param {string} endpointUrl - Target HTTP endpoint.
   * @returns {Promise<Response>}
   */
  static async sendPatientAdmission(patientData, endpointUrl) {
    const message = HL7Builder.createBaseMessage('MYAPP', 'MYFACILITY', 'RECVAPP', 'RECVFACILITY', 'ADT^A01');
    HL7Builder.addPIDSegment(message, patientData);
    return await HL7HttpTransporter.send(endpointUrl, message);
  }

  /**
   * Generates and sends an ORM (Order) message.
   * @param {Object} patientData - Patient details.
   * @param {Object} orderData - Order details.
   * @param {string} endpointUrl - Target HTTP endpoint.
   * @returns {Promise<Response>}
   */
  static async sendOrderMessage(patientData, orderData, endpointUrl) {
    const message = HL7Builder.createBaseMessage('MYAPP', 'MYFACILITY', 'RECVAPP', 'RECVFACILITY', 'ORM^O01');
    HL7Builder.addPIDSegment(message, patientData);
    HL7Builder.addOBRSegment(message, orderData);
    return await HL7HttpTransporter.send(endpointUrl, message);
  }

  /**
   * Generates and sends an ORU (Observation Result) message.
   * @param {Object} patientData - Patient details.
   * @param {Object} resultData - Observation results.
   * @param {string} endpointUrl - Target HTTP endpoint.
   * @returns {Promise<Response>}
   */
  static async sendObservationResult(patientData, resultData, endpointUrl) {
    const message = HL7Builder.createBaseMessage('MYAPP', 'MYFACILITY', 'RECVAPP', 'RECVFACILITY', 'ORU^R01');
    HL7Builder.addPIDSegment(message, patientData);
    HL7Builder.addOBRSegment(message, { universalServiceId: resultData.serviceId });
    HL7Builder.addOBXSegment(message, resultData);
    return await HL7HttpTransporter.send(endpointUrl, message);
  }

  /**
   * Parses an incoming raw HL7 message string.
   * @param {string} rawMessage - Raw HL7 text.
   * @returns {Object} Parsed representation.
   */
  static parseMessage(rawMessage) {
    return HL7Parser.parse(rawMessage);
  }

  /**
   * Extracts patient information from a parsed message.
   * @param {Object} parsedMessage - Message object from parseMessage.
   * @returns {Object|null} Extracted patient info or null.
   */
  static extractPatientInfo(parsedMessage) {
    const pid = HL7Parser.getSegment(parsedMessage, 'PID');
    if (!pid) return null;

    return {
      patientId: pid.getField(3),
      patientName: pid.getField(5),
      dateOfBirth: pid.getField(7),
      gender: pid.getField(8)
    };
  }
}

export default HL7Facade;
