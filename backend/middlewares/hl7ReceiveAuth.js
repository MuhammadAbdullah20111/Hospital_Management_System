export const validateReceiveKey = (req, res, next) => {
  const providedKey = req.headers['x-hl7-api-key'] || req.headers['x-api-key'];
  
  // Hardcoded fallback for testing, but prefers .env
  const expectedKey = process.env.HL7_RECEIVE_API_KEY || 'sk_live_hl7_default_key_123';

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid or missing HL7 webhook key' });
  }
  next();
};
