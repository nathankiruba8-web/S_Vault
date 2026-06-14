import twilio from 'twilio';
import crypto from 'crypto';

let client = null;

const getClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendWhatsAppOtp = async (phoneNumber, otp) => {
  const twilioClient = getClient();
  if (!twilioClient) {
    console.warn('Twilio not configured');
    return { success: false, message: 'WhatsApp service not configured' };
  }

  const formattedPhone = phoneNumber.startsWith('whatsapp:')
    ? phoneNumber
    : phoneNumber.startsWith('+')
      ? `whatsapp:${phoneNumber}`
      : `whatsapp:+${phoneNumber}`;

  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedPhone,
      body: `Your SecureVault verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
    });
    return { success: true };
  } catch (error) {
    console.error('WhatsApp OTP send failed:', error.message);
    return { success: false, message: error.message };
  }
};
