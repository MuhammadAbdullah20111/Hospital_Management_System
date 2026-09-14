import hl7 from 'simple-hl7';

/**
 * Subsystem: Parses raw HL7 messages into JavaScript objects.
 */
export class HL7Parser {
  /**
   * Parses a raw HL7 string message.
   * @param {string} rawMessage - The raw HL7 string.
   * @returns {Object} A parsed message object from simple-hl7.
   */
  static parse(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'string') {
      throw new Error("Invalid raw HL7 message provided to parser.");
    }
    
    try {
      const parser = new hl7.Parser();
      // simple-hl7 parser returns a Message object
      const message = parser.parse(rawMessage.trim());
      return message;
    } catch (error) {
      console.error("HL7 Parsing Error:", error);
      throw new Error(`Failed to parse HL7 message: ${error.message}`);
    }
  }

  /**
   * Extracts a specific segment from a parsed message.
   * @param {Object} message - The parsed simple-hl7 message object.
   * @param {string} segmentName - Name of the segment (e.g., 'PID', 'OBR').
   * @returns {Object|null} The segment object or null if not found.
   */
  static getSegment(message, segmentName) {
    return message.getSegment(segmentName) || null;
  }
}
