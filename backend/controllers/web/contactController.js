import prisma from '../../config/prismaClient.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { sendMail } from '../../services/mailService.js';
import dayjs from 'dayjs';

/**
 * POST /api/contact
 * Public endpoint — no auth required.
 * Saves the message to the DB and sends a notification email to the clinic.
 */
export const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic server-side validation
        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return ApiResponse.error(res, 'Name, email, and message are required.', 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return ApiResponse.error(res, 'Please provide a valid email address.', 400);
        }

        // Save to database
        const contactMessage = await prisma.contactMessage.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                subject: subject?.trim() || 'General Inquiry',
                message: message.trim(),
            },
        });

        // Send notification email to clinic (fire-and-forget — don't fail the request if email fails)
        const clinicEmail = process.env.SMTP_USER;
        if (clinicEmail) {
            const receivedAt = dayjs().format('MMMM D, YYYY h:mm A');
            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #0d9488; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .content { padding: 32px; line-height: 1.7; }
    .field-label { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #111827; margin-bottom: 20px; }
    .message-box { background-color: #f0fdf4; border-left: 4px solid #0d9488; padding: 16px; border-radius: 0 6px 6px 0; margin: 8px 0 20px 0; white-space: pre-wrap; font-size: 15px; color: #111827; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📩 New Contact Message — MKMC</h1>
    </div>
    <div class="content">
      <p>You have received a new message through the MKMC website contact form.</p>
      <div class="field-label">From</div>
      <div class="field-value">${contactMessage.name} &lt;${contactMessage.email}&gt;</div>
      <div class="field-label">Subject</div>
      <div class="field-value"><span class="badge">${contactMessage.subject}</span></div>
      <div class="field-label">Message</div>
      <div class="message-box">${contactMessage.message}</div>
      <div class="field-label">Received At</div>
      <div class="field-value">${receivedAt}</div>
      <p style="color:#6b7280; font-size:13px;">Reply directly to <strong>${contactMessage.email}</strong> to respond to this inquiry.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MKMC. All rights reserved.</p>
      <p>This is an automated notification from the MKMC contact form.</p>
    </div>
  </div>
</body>
</html>`;

            sendMail(
                clinicEmail,
                `New Contact Message: ${contactMessage.subject} — from ${contactMessage.name}`,
                emailHtml
            ).catch((err) => {
                console.error('[ContactController] Email notification failed (non-fatal):', err.message);
            });
        }

        return ApiResponse.success(res, 'Your message has been received. We will get back to you shortly.');
    } catch (error) {
        console.error('[ContactController] ERROR:', error?.message);
        console.error('[ContactController] CODE:', error?.code);
        console.error('[ContactController] STACK:', error?.stack);
        next(error);
    }
};
