import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('Server is ready to take our messages');
        return true;
    } catch (error) {
        console.error('Error verifying mail server connection:', error);
        return false;
    }
};

const getBaseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
    .content { padding: 32px; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px; }
    .info-box { background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MKMC Portal</h1>
    </div>
    <div class="content">
      <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MKMC. All rights reserved.</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"MKMC Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

export const sendLoginNotificationMail = async (email, name, role, ipAddress, userAgent) => {
  const time = dayjs().format('MMMM D, YYYY h:mm A');
  const title = "New Login Detected";
  const content = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>We detected a new login to your MKMC <strong>${role}</strong> account.</p>
    <div class="info-box">
      <p style="margin:0 0 8px 0;"><strong>Time:</strong> ${time}</p>
      <p style="margin:0 0 8px 0;"><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
      <p style="margin:0;"><strong>Device/Browser:</strong> ${userAgent || 'Unknown'}</p>
    </div>
    <p>If this was you, you can safely ignore this email. If you don't recognize this activity, please reset your password immediately and contact an administrator.</p>
  `;
  return sendMail(email, title, getBaseTemplate(title, content));
};

export const send2FAMail = async (email, otp) => {
  const title = "Your Authentication Code";
  const content = `
    <p>You have requested to log in using Two-Factor Authentication.</p>
    <div style="text-align: center; margin: 32px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 16px 24px; border-radius: 8px; border: 1px dashed #bfdbfe;">
        ${otp}
      </span>
    </div>
    <p style="color: #dc2626; font-weight: 500;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
  `;
  return sendMail(email, title, getBaseTemplate(title, content));
};

export const sendForgotPasswordMail = async (email, otp) => {
  const title = "Password Reset Request";
  const content = `
    <p>We received a request to reset your password for your MKMC portal account.</p>
    <div style="text-align: center; margin: 32px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 16px 24px; border-radius: 8px; border: 1px dashed #bfdbfe;">
        ${otp}
      </span>
    </div>
    <p style="color: #dc2626; font-weight: 500;">This OTP is valid for 5 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  `;
  return sendMail(email, title, getBaseTemplate(title, content));
};

export const sendProfileUpdateMail = async (email, name, updates) => {
  const title = "Profile Update Successful";
  let changesList = Object.keys(updates).map(k => `<li><strong>${k}:</strong> Updated</li>`).join('');
  
  const content = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your MKMC profile has been successfully updated. The following sections were modified:</p>
    <ul>
      ${changesList || '<li>Profile details</li>'}
    </ul>
    <p>If you did not make these changes, please secure your account immediately.</p>
  `;
  return sendMail(email, title, getBaseTemplate(title, content));
};

export const sendPasswordChangedMail = async (email, name) => {
  const title = "Password Successfully Changed";
  const content = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your password for the MKMC portal has been successfully updated.</p>
    <p>If you did not perform this action, please contact your system administrator immediately as your account may be compromised.</p>
  `;
  return sendMail(email, title, getBaseTemplate(title, content));
};

