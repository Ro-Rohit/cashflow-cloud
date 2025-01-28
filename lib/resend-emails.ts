import { Resend } from 'resend';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URl;

export function generateSecureToken(length = 4) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  return { token, expiresAt };
}

export const generateEmailTemplate = (username: string, verificationCode: string) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #d9534f; text-align: center;">Account Deletion Request</h2>

      <p>Hi ${username},</p>

      <p>We received a request to permanently delete your account. To confirm this action, please use the verification code below:</p>

      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 2px; border-radius: 4px; border: 1px solid #ddd;">
        ${verificationCode}
      </div>

      <p>If you didn’t request this, please ignore this email or contact our support team immediately.</p>

      <p>Thank you,</p>
      <p><strong>The Support Team</strong></p>

      <footer style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; color: #777; text-align: center;">
        <p>This email was sent to you because a deletion request was initiated. If you have any concerns, please contact support.</p>
      </footer>
    </div>
  `;
};

export const generateBillReminderTemplate = (details: {
  customerName: string;
  billNumber: string;
  dueDate: string;
  amount: number;
}) => {
  const { customerName, billNumber, dueDate, amount } = details;

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="text-align: center; color: #d9534f;">Bill Payment Reminder</h2>

      <p>Dear <strong>${customerName}</strong>,</p>

      <p>
        This is a friendly reminder regarding your pending bill. Below are the details of your outstanding payment:
      </p>

      <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border: 1px solid #ddd; border-radius: 4px;">
        <p><strong>Bill Number:</strong> ${billNumber}</p>
        <p><strong>Amount Due:</strong> ₹${amount.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
      </div>

      <p>
        Please ensure that the payment is made before the due date to avoid any late charges. If you’ve already made the payment, kindly disregard this reminder.
      </p>

      <p>
        If you have any questions or need assistance, checkout to Cashflow Cloud 
        <a href="${APP_URL}" style="color: #007BFF;">Cashflow Cloud Support</a>.
      </p>

      <p>Thank you for your prompt attention to this matter.</p>

      <footer style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; text-align: center; color: #777;">
        <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </footer>
    </div>
  `;
};

export const sendEmail = async (email: string, subject: string, body: string) => {
  if (!COMPANY_EMAIL || !RESEND_API_KEY) {
    throw new Error('Missing RESEND required environment variables');
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (!resend.key) {
    throw new Error('RESEND not configured properly');
  }

  return await resend.emails.send({
    from: COMPANY_EMAIL,
    to: email,
    subject: subject,
    html: body,
  });
};
