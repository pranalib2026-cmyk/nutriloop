import twilio from 'twilio';
import logger from './logger.js';

const MOCK_MODE =
  process.env.NODE_ENV !== 'production' || !process.env.TWILIO_ACCOUNT_SID;

export async function sendSMS(to, message) {
  if (MOCK_MODE) {
    logger.info(`[SMS MOCK] To: ${to} | Message: ${message}`);
    return { mock: true, message };
  }
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    return await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM,
      to,
    });
  } catch (error) {
    logger.error('Failed to send SMS', { error: error.message, to });
    throw error;
  }
}
