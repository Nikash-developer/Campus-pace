// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Campus Pace Alerts" <${process.env.SMTP_USER || 'no-reply@campuspace.edu'}>`, 
      to,
      subject,
      text: text || "Please view this email in an HTML compatible client.",
      html, 
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Templates
export const templates = {
  defaulterWarning: (studentName: string, subjectName: string, percentage: string | number, lecturesNeeded: number, remaining: number) => ({
    subject: `[LMS Alert] Attendance Concern - ${subjectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #f97316;">Attendance Warning</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your attendance in <strong>${subjectName}</strong> is currently at <strong>${percentage}%</strong>.</p>
        <p>You need to attend <strong>${lecturesNeeded}</strong> of the remaining <strong>${remaining}</strong> lectures to reach the required 75% threshold.</p>
        <p>Please prioritize attending upcoming classes to avoid any academic penalties.</p>
        <br>
        <p>Best regards,<br>Campus Pace Administration</p>
      </div>
    `,
    text: `Dear ${studentName},\n\nYour attendance in ${subjectName} is currently ${percentage}%. You need to attend ${lecturesNeeded} of the remaining ${remaining} lectures to reach the required 75%.\n\nPlease prioritize attending upcoming classes.`
  }),
  
  criticalAlert: (studentName: string, subjectName: string, percentage: string | number, lecturesNeeded: number, remaining: number) => ({
    subject: `[URGENT] Attendance Below 65% - ${subjectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #ef4444;">CRITICAL ATTENDANCE ALERT</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your attendance in <strong>${subjectName}</strong> has dropped to a critical level of <strong>${percentage}%</strong>.</p>
        <p><strong>This requires your immediate attention!</strong> You must attend ${lecturesNeeded} out of the next ${remaining} lectures.</p>
        <p>Failure to improve your attendance may result in debarment from the final examinations. Please contact your HOD immediately to discuss an attendance recovery plan.</p>
        <br>
        <p>Best regards,<br>Campus Pace Administration</p>
      </div>
    `,
    text: `URGENT ALERT\n\nDear ${studentName},\n\nYour attendance in ${subjectName} has dropped to a critical level of ${percentage}%. You must attend ${lecturesNeeded} of the next ${remaining} lectures. Failure to improve may result in debarment. Please contact your HOD immediately.`
  })
};
