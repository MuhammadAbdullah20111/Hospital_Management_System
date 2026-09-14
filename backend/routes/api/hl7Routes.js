import express from 'express';
import { sendPatientAdmitHL7, sendOrderHL7, sendResultHL7, receiveHL7 } from '../../controllers/hl7Controller.js';
import { validateReceiveKey } from '../../middlewares/hl7ReceiveAuth.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Because HL7 bodies are plain text, we need a special text parser middleware for the receive route
// Protected by static API key
router.post('/receive', express.text({ type: ['text/plain', 'application/hl7-v2'] }), validateReceiveKey, receiveHL7);

// Send an HL7 ADT message using database data (Protected by JWT)
router.post('/send-admit', authenticate, sendPatientAdmitHL7);

// Send an HL7 ORM (Order) message using database data (Protected by JWT)
router.post('/send-order', authenticate, sendOrderHL7);

// Send an HL7 ORU (Observation Result) message using database data (Protected by JWT)
router.post('/send-result', authenticate, sendResultHL7);

export default router;
