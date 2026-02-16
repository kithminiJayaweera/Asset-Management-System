import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    cid: string;
  }>;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, attachments }: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Attempting to send email...');
    console.log('From:', process.env.EMAIL_FROM);
    console.log('To:', to);
    console.log('Subject:', subject);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

export function generateRejectionEmail(
  userName: string,
  assetCategory: string,
  reason: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .reason-box { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Asset Request Rejected</h2>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          
          <p>We regret to inform you that your asset request has been rejected.</p>
          
          <p><strong>Asset Category:</strong> ${assetCategory}</p>
          
          <div class="reason-box">
            <strong>Reason for Rejection:</strong>
            <p style="margin: 10px 0 0 0;">${reason}</p>
          </div>
          
          <p>If you have any questions or would like to discuss this decision, please contact your administrator.</p>
          
          <p>Best regards,<br>Asset Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Asset Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function generateApprovalEmail(
  userName: string,
  assetCategory: string,
  assetName?: string,
  assetTag?: string
): Promise<{ html: string; attachments?: Array<{ filename: string; content: Buffer; cid: string }> }> {
  console.log('📝 Generating approval email for:', { userName, assetCategory, assetName, assetTag });
  
  let qrCodeBuffer: Buffer | null = null;
  const attachments: Array<{ filename: string; content: Buffer; cid: string }> = [];
  
  if (assetTag) {
    try {
      console.log('📱 Generating QR code for asset tag:', assetTag);
      qrCodeBuffer = await QRCode.toBuffer(assetTag, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      attachments.push({
        filename: 'qr-code.png',
        content: qrCodeBuffer,
        cid: 'qrcode'
      });
      
      console.log('✅ QR code generated successfully');
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
    }
  } else {
    console.log('⚠️ No asset tag provided, skipping QR code generation');
  }
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .asset-box { background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; }
        .qr-section { text-align: center; margin: 20px 0; padding: 20px; background-color: white; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Asset Request Approved!</h2>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          
          <p>Great news! Your asset request has been approved and the asset has been assigned to you.</p>
          
          <div class="asset-box">
            <strong>Asset Details:</strong>
            <p style="margin: 10px 0 0 0;">
              <strong>Category:</strong> ${assetCategory}<br>
              ${assetName ? `<strong>Asset Name:</strong> ${assetName}<br>` : ''}
              ${assetTag ? `<strong>Asset Tag:</strong> ${assetTag}` : ''}
            </p>
          </div>
          
          ${qrCodeBuffer ? `
          <div class="qr-section">
            <h3 style="margin-top: 0; color: #16a34a;">Asset QR Code</h3>
            <img src="cid:qrcode" alt="Asset QR Code" style="border: 1px solid #e5e7eb; border-radius: 4px; max-width: 150px;">
            <p style="font-size: 12px; color: #6b7280; margin: 10px 0 0 0;">Scan this QR code to quickly access asset information</p>
          </div>
          ` : ''}
          
          <p>Please contact your administrator to arrange for asset pickup or delivery.</p>
          
          <p>Best regards,<br>Asset Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Asset Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  console.log('✅ Email HTML generated successfully');
  return { html: emailHtml, attachments: attachments.length > 0 ? attachments : undefined };
}
