import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token
 * @param {Object} payload - The payload to encdoe in the token
 * @param {string} expiresIn - Expiration time (default: '1d')
 * @returns {string} - The generated token
 */
export const generateToken = (payload, expiresIn = '1d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verifies a JWT token
 * @param {string} token - The token to verify
 * @returns {Object} - The decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
