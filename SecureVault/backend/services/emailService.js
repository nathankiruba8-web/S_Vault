import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email not configured, skipping send');
    return false;
  }
  await transport.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
  return true;
};

export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to SecureVault',
    html: `<h2>Welcome, ${user.name}!</h2><p>Your SecureVault account has been created. Keep your passwords safe.</p>`,
  });
};
