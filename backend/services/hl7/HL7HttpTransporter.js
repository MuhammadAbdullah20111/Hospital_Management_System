import prisma from '../../config/prismaClient.js';

/**
 * Subsystem: Handles HTTP communication for HL7 messages.
 */
export class HL7HttpTransporter {
  /**
   * Sends an HL7 message via HTTP POST.
   * @param {string} endpointUrl - The target URL (optional, defaults to env var).
   * @param {Object} message - The simple-hl7 Message object.
   * @returns {Promise<Response>} The fetch Response object.
   */
  static async send(endpointUrl, message) {
    const targetUrl = endpointUrl || process.env.HL7_DEFAULT_ENDPOINT_URL;
    if (!targetUrl) throw new Error("Endpoint URL is required and no default is set in .env.");
    
    const rawMessage = message.toString();
    const timeoutMs = parseInt(process.env.HL7_OUTBOUND_TIMEOUT_MS) || 30000;
    const apiKey = process.env.HL7_RECEIVE_API_KEY || 'sk_live_hl7_default_key_123';

    // Extract basic details for logging
    const type = message.header.getField(8) || 'UNKNOWN'; // MSH-9 (1-based index 9, simple-hl7 is 1-based, wait no: MSH is 0-based in getField? Let's use getField(9))
    const messageId = message.header.getField(10) || 'UNKNOWN';

    // Wait, simple-hl7 getField is 1-based for the segment fields after the segment name. 
    // MSH-9 is message type. MSH-10 is control ID.
    const msgType = message.header.getField(9) || 'UNKNOWN';
    const msgControlId = message.header.getField(10) || 'UNKNOWN';

    let logStatus = 'PROCESSED';
    let errorDetails = null;
    let response;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/hl7-v2', // Standard MIME type for HL7
          'Accept': 'application/hl7-v2, text/plain, application/json',
          'x-hl7-api-key': apiKey // Secure outbound with API key
        },
        body: rawMessage,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("HL7 HTTP Transmission Error:", error);
      logStatus = 'ERROR';
      errorDetails = error.message;
      throw error;
    } finally {
      // Create Audit Log
      try {
        await prisma.hl7Log.create({
          data: {
            messageId: msgControlId,
            type: msgType,
            direction: 'OUTBOUND',
            rawMessage: rawMessage,
            status: logStatus,
            errorDetails: errorDetails
          }
        });
      } catch (dbError) {
        console.error("Failed to write to Hl7Log:", dbError);
      }
    }

    return response;
  }
}

