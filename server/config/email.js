import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, use services like SendGrid, AWS SES, Mailgun, etc.

  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // If no email credentials are configured, use ethereal (test email service)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️  Email credentials not configured. Using test mode.');
    console.log('📧 To enable real emails, add EMAIL_USER and EMAIL_PASSWORD to .env file');
    return null;
  }

  return nodemailer.createTransport(emailConfig);
};

// Send verification email
export const sendVerificationEmail = async (email, token, userType) => {
  const transporter = createTransporter();

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${userType}/verify-email?token=${token}`;

  // If no transporter (no email config), just log to console
  if (!transporter) {
    console.log('\n📧 Verification Email (Test Mode):');
    console.log(`To: ${email}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log('Copy this link and paste it in your browser to verify the email.\n');
    return true;
  }

  // Email template
  const mailOptions = {
    from: `"Pasalubong Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Pasalubong',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #0f172a;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            color: #475569;
            margin-bottom: 20px;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #ef4444, #f43f5e);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
          }
          .button:hover {
            background: linear-gradient(135deg, #dc2626, #ef4444);
          }
          .link-box {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 14px;
            color: #64748b;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
          }
          .tips {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .tips p {
            margin: 5px 0;
            font-size: 14px;
            color: #991b1b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Pasalubong</h1>
          </div>
          
          <div class="content">
            <h2>Verify Your Email Address</h2>
            
            <p>Hello!</p>
            
            <p>Thank you for registering with Pasalubong! To complete your registration and start enjoying authentic Filipino gifts and delicacies, please verify your email address.</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button" style="color: white;">Verify Email Address</a>
            </div>
            
            <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <div class="link-box">${verificationLink}</div>
            
            <div class="tips">
              <p><strong>⏰ This link will expire in 24 hours</strong></p>
              <p>If you didn't create an account with Pasalubong, you can safely ignore this email.</p>
            </div>
            
            <p style="margin-top: 30px;">Need help? Contact our support team at support@pasalubong.com</p>
          </div>
          
          <div class="footer">
            <p><strong>Pasalubong</strong> - Authentic Filipino Gifts & Delicacies</p>
            <p>Carigara & Barugo, Leyte, Philippines</p>
            <p style="margin-top: 15px; font-size: 12px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Verify Your Email Address
      
      Hello!
      
      Thank you for registering with Pasalubong! To complete your registration, please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with Pasalubong, you can safely ignore this email.
      
      Need help? Contact our support team at support@pasalubong.com
      
      ---
      Pasalubong - Authentic Filipino Gifts & Delicacies
      Carigara & Barugo, Leyte, Philippines
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    // Don't throw error - allow registration to continue even if email fails
    // Log the verification link for development
    console.log('\n📧 Verification Link (Email failed to send):');
    console.log(`To: ${email}`);
    console.log(`Link: ${verificationLink}\n`);
    return false;
  }
};

// Send password reset email with verification code
export const sendPasswordResetEmail = async (email, code, userType) => {
  const transporter = createTransporter();

  // If no transporter (no email config), just log to console
  if (!transporter) {
    console.log('\n🔐 Password Reset Code (Test Mode):');
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log(`User Type: ${userType}`);
    console.log('Use this code to reset your password.\n');
    return true;
  }

  // Email template
  const mailOptions = {
    from: `"Pasalubong Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Pasalubong',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #0f172a;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            color: #475569;
            margin-bottom: 20px;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #ef4444, #f43f5e);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
          }
          .button:hover {
            background: linear-gradient(135deg, #dc2626, #ef4444);
          }
          .link-box {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 14px;
            color: #64748b;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
          }
          .warning {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning p {
            margin: 5px 0;
            font-size: 14px;
            color: #991b1b;
          }
          .security-tips {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .security-tips p {
            margin: 5px 0;
            font-size: 14px;
            color: #166534;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Pasalubong</h1>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            
            <p>Hello!</p>
            
            <p>We received a request to reset your password for your Pasalubong account. Use the verification code below to proceed:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f1f5f9; padding: 20px 40px; border-radius: 12px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">
                ${code}
              </div>
            </div>
            
            <p style="text-align: center; color: #64748b; font-size: 14px;">Enter this code on the password reset page</p>
            
            <div class="warning">
              <p><strong>⏰ This link will expire in 1 hour</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            
            <div class="security-tips">
              <p><strong>🔒 Security Tips:</strong></p>
              <p>• Never share your password with anyone</p>
              <p>• Use a strong, unique password</p>
              <p>• Enable two-factor authentication when available</p>
            </div>
            
            <p style="margin-top: 30px;">Need help? Contact our support team at support@pasalubong.com</p>
          </div>
          
          <div class="footer">
            <p><strong>Pasalubong</strong> - Authentic Filipino Gifts & Delicacies</p>
            <p>Carigara & Barugo, Leyte, Philippines</p>
            <p style="margin-top: 15px; font-size: 12px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Your Password
      
      Hello!
      
      We received a request to reset your password for your Pasalubong account. Use the verification code below to proceed:
      
      Verification Code: ${code}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      
      Security Tips:
      • Never share your password with anyone
      • Use a strong, unique password
      • Enable two-factor authentication when available
      
      Need help? Contact our support team at support@pasalubong.com
      
      ---
      Pasalubong - Authentic Filipino Gifts & Delicacies
      Carigara & Barugo, Leyte, Philippines
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset code sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    // Don't throw error - log the code for development
    console.log('\n🔐 Password Reset Code (Email failed to send):');
    console.log(`To: ${email}`);
    console.log(`Code: ${code}\n`);
    return false;
  }
};

export default { sendVerificationEmail, sendPasswordResetEmail };