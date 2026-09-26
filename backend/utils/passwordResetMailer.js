const nodemailer = require('nodemailer');

const isPasswordResetEmailConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_FROM
);

const sendPasswordResetEmail = async (email, resetUrl) => {
  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your Tiny Tome password',
    text: `Use this secure link to reset your Tiny Tome password. It expires in 15 minutes: ${resetUrl}`,
    html: `<p>We received a request to reset your Tiny Tome password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request a reset, you can ignore this email.</p>`,
  });
};

module.exports = { isPasswordResetEmailConfigured, sendPasswordResetEmail };
