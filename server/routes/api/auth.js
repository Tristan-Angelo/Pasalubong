import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Buyer from '../../models/Buyer.js';
import Seller from '../../models/Seller.js';
import Delivery from '../../models/Delivery.js';
import Admin from '../../models/Admin.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../config/email.js';
import { generateToken } from '../../middleware/authMiddleware.js';

const router = Router();

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper function to generate 6-digit code
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============= BUYER ROUTES =============

// Buyer Registration
router.post('/buyer/register', async (req, res) => {
  try {
    const { fullname, email, phone, region, province, city, barangay, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide all required information' 
      });
    }

    // Check if user already exists as a buyer
    const existingBuyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (existingBuyer) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'This email is already registered as a buyer',
        field: 'email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const newBuyer = await Buyer.create({
      fullname,
      email: email.toLowerCase(),
      phone,
      region,
      province,
      city,
      barangay,
      password: hashedPassword,
      verificationToken,
      isEmailVerified: false
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, 'buyer');

    // Remove password from response
    const buyerObject = newBuyer.toObject();
    delete buyerObject.password;

    res.status(201).json({
      success: true,
      message: 'Buyer registered successfully. Please check your email to verify your account.',
      user: buyerObject
    });
  } catch (error) {
    console.error('Buyer registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred during registration' 
    });
  }
});

// Buyer Login
router.post('/buyer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const buyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (!buyer) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'No account found with this email',
        field: 'email'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, buyer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Incorrect password',
        field: 'password'
      });
    }

    // Generate JWT token
    const token = generateToken(buyer._id);

    // Remove password and verification token from response
    const buyerObject = buyer.toObject();
    delete buyerObject.password;
    delete buyerObject.verificationToken;

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: buyerObject
    });
  } catch (error) {
    console.error('Buyer login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login' 
    });
  }
});

// Buyer Email Verification
router.get('/buyer/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Verification token is required'
      });
    }

    // Find buyer with this token
    const buyer = await Buyer.findOne({ verificationToken: token });
    if (!buyer) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    buyer.isEmailVerified = true;
    buyer.verificationToken = null;
    await buyer.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Buyer email verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Buyer Forgot Password
router.post('/buyer/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find buyer
    const buyer = await Buyer.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent user enumeration attacks
    // Only send code if user exists
    if (!buyer) {
      console.log(`⚠️  Password reset attempted for non-existent buyer email: ${email}`);
      // Return success but don't send any code
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a verification code shortly.'
      });
    }

    // Generate 6-digit code and token
    const resetCode = generateSixDigitCode();
    const resetToken = generateVerificationToken();
    
    buyer.resetPasswordCode = resetCode;
    buyer.resetPasswordToken = resetToken;
    buyer.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await buyer.save();

    // Send reset email with code - ONLY for existing users
    await sendPasswordResetEmail(email, resetCode, 'buyer');

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a verification code.'
    });
  } catch (error) {
    console.error('Buyer forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: 'An error occurred while processing your request'
    });
  }
});

// Buyer Verify Reset Code
router.post('/buyer/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and code are required'
      });
    }

    // Find buyer with valid code
    const buyer = await Buyer.findOne({
      email: email.toLowerCase(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!buyer) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Invalid or expired verification code'
      });
    }

    // Return the token for password reset
    res.json({
      success: true,
      message: 'Code verified successfully',
      token: buyer.resetPasswordToken
    });
  } catch (error) {
    console.error('Buyer verify reset code error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Buyer Verify Reset Token
router.get('/buyer/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Reset token is required'
      });
    }

    // Find buyer with valid token
    const buyer = await Buyer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!buyer) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Buyer verify reset token error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Buyer Reset Password
router.post('/buyer/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Token and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Find buyer with valid token
    const buyer = await Buyer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!buyer) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token and code
    buyer.password = hashedPassword;
    buyer.resetPasswordToken = null;
    buyer.resetPasswordCode = null;
    buyer.resetPasswordExpires = null;
    await buyer.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Buyer reset password error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: 'An error occurred while resetting password'
    });
  }
});

// Buyer Resend Verification Email
router.post('/buyer/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find buyer
    const buyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (!buyer) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email'
      });
    }

    // Check if already verified
    if (buyer.isEmailVerified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'This email is already verified'
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    buyer.verificationToken = verificationToken;
    await buyer.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, 'buyer');

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error) {
    console.error('Buyer resend verification error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: 'An error occurred while sending verification email'
    });
  }
});

// Buyer Check Verification Status
router.get('/buyer/check-verification', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find buyer
    const buyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (!buyer) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email'
      });
    }

    res.json({
      success: true,
      isVerified: buyer.isEmailVerified
    });
  } catch (error) {
    console.error('Buyer check verification error:', error);
    res.status(500).json({
      error: 'Check failed',
      message: 'An error occurred while checking verification status'
    });
  }
});

// ============= SELLER ROUTES =============

// Seller Registration
router.post('/seller/register', async (req, res) => {
  try {
    const { 
      businessName, 
      ownerName, 
      email, 
      phone, 
      businessType, 
      region, 
      province, 
      city, 
      barangay, 
      password 
    } = req.body;

    // Validate required fields
    if (!businessName || !ownerName || !email || !phone || !businessType || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide all required information' 
      });
    }

    // Check if user already exists as a seller
    const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
    if (existingSeller) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'This email is already registered as a seller',
        field: 'email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const newSeller = await Seller.create({
      businessName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      businessType,
      region,
      province,
      city,
      barangay,
      password: hashedPassword,
      verificationToken,
      isEmailVerified: false
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, 'seller');

    // Remove password from response
    const sellerObject = newSeller.toObject();
    delete sellerObject.password;

    res.status(201).json({
      success: true,
      message: 'Seller registered successfully. Please check your email to verify your account.',
      user: sellerObject
    });
  } catch (error) {
    console.error('Seller registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred during registration' 
    });
  }
});

// Seller Login
router.post('/seller/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'No account found with this email',
        field: 'email'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Incorrect password',
        field: 'password'
      });
    }

    // Generate JWT token
    const token = generateToken(seller._id);

    // Remove password and verification token from response
    const sellerObject = seller.toObject();
    delete sellerObject.password;
    delete sellerObject.verificationToken;

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: sellerObject
    });
  } catch (error) {
    console.error('Seller login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login' 
    });
  }
});

// Seller Email Verification
router.get('/seller/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Verification token is required'
      });
    }

    // Find seller with this token
    const seller = await Seller.findOne({ verificationToken: token });
    if (!seller) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    seller.isEmailVerified = true;
    seller.verificationToken = null;
    await seller.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Seller email verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Seller Forgot Password
router.post('/seller/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find seller
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent user enumeration attacks
    // Only send code if user exists
    if (!seller) {
      console.log(`⚠️  Password reset attempted for non-existent seller email: ${email}`);
      // Return success but don't send any code
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a verification code shortly.'
      });
    }

    // Generate 6-digit code and token
    const resetCode = generateSixDigitCode();
    const resetToken = generateVerificationToken();
    
    seller.resetPasswordCode = resetCode;
    seller.resetPasswordToken = resetToken;
    seller.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await seller.save();

    // Send reset email with code - ONLY for existing users
    await sendPasswordResetEmail(email, resetCode, 'seller');

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a verification code.'
    });
  } catch (error) {
    console.error('Seller forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: 'An error occurred while processing your request'
    });
  }
});

// Seller Verify Reset Code
router.post('/seller/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and code are required'
      });
    }

    // Find seller with valid code
    const seller = await Seller.findOne({
      email: email.toLowerCase(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!seller) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Invalid or expired verification code'
      });
    }

    // Return the token for password reset
    res.json({
      success: true,
      message: 'Code verified successfully',
      token: seller.resetPasswordToken
    });
  } catch (error) {
    console.error('Seller verify reset code error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Seller Verify Reset Token
router.get('/seller/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Reset token is required'
      });
    }

    // Find seller with valid token
    const seller = await Seller.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!seller) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Seller verify reset token error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Seller Reset Password
router.post('/seller/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Token and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Find seller with valid token
    const seller = await Seller.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!seller) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token and code
    seller.password = hashedPassword;
    seller.resetPasswordToken = null;
    seller.resetPasswordCode = null;
    seller.resetPasswordExpires = null;
    await seller.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Seller reset password error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: 'An error occurred while resetting password'
    });
  }
});

// Seller Resend Verification Email
router.post('/seller/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find seller
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email'
      });
    }

    // Check if already verified
    if (seller.isEmailVerified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'This email is already verified'
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    seller.verificationToken = verificationToken;
    await seller.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, 'seller');

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error) {
    console.error('Seller resend verification error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: 'An error occurred while sending verification email'
    });
  }
});

// Seller Check Verification Status
router.get('/seller/check-verification', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find seller
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email'
      });
    }

    res.json({
      success: true,
      isVerified: seller.isEmailVerified
    });
  } catch (error) {
    console.error('Seller check verification error:', error);
    res.status(500).json({
      error: 'Check failed',
      message: 'An error occurred while checking verification status'
    });
  }
});

// ============= DELIVERY ROUTES =============

// Delivery Registration
router.post('/delivery/register', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      vehicleType, 
      licenseNumber, 
      region, 
      province, 
      city, 
      barangay, 
      password 
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !vehicleType || !licenseNumber || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide all required information' 
      });
    }

    // Check if user already exists as a delivery partner
    const existingDelivery = await Delivery.findOne({ email: email.toLowerCase() });
    if (existingDelivery) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'This email is already registered as a delivery partner',
        field: 'email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const newDelivery = await Delivery.create({
      fullname: fullName,
      email: email.toLowerCase(),
      phone,
      vehicleType,
      licenseNumber,
      region,
      province,
      city,
      barangay,
      password: hashedPassword,
      verificationToken,
      isEmailVerified: false
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, 'delivery');

    // Remove password from response
    const deliveryObject = newDelivery.toObject();
    delete deliveryObject.password;

    res.status(201).json({
      success: true,
      message: 'Delivery partner registered successfully. Please check your email to verify your account.',
      user: deliveryObject
    });
  } catch (error) {
    console.error('Delivery registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred during registration' 
    });
  }
});

// Delivery Login
router.post('/delivery/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const delivery = await Delivery.findOne({ email: email.toLowerCase() });
    if (!delivery) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'No account found with this email',
        field: 'email'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, delivery.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Incorrect password',
        field: 'password'
      });
    }

    // Generate JWT token
    const token = generateToken(delivery._id);

    // Remove password and verification token from response
    const deliveryObject = delivery.toObject();
    delete deliveryObject.password;
    delete deliveryObject.verificationToken;

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: deliveryObject
    });
  } catch (error) {
    console.error('Delivery login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login' 
    });
  }
});

// Delivery Email Verification
router.get('/delivery/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Verification token is required'
      });
    }

    // Find delivery partner with this token
    const delivery = await Delivery.findOne({ verificationToken: token });
    if (!delivery) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    delivery.isEmailVerified = true;
    delivery.verificationToken = null;
    await delivery.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Delivery email verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Delivery Forgot Password
router.post('/delivery/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find delivery partner
    const delivery = await Delivery.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent user enumeration attacks
    // Only send code if user exists
    if (!delivery) {
      console.log(`⚠️  Password reset attempted for non-existent delivery email: ${email}`);
      // Return success but don't send any code
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a verification code shortly.'
      });
    }

    // Generate 6-digit code and token
    const resetCode = generateSixDigitCode();
    const resetToken = generateVerificationToken();
    
    delivery.resetPasswordCode = resetCode;
    delivery.resetPasswordToken = resetToken;
    delivery.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await delivery.save();

    // Send reset email with code - ONLY for existing users
    await sendPasswordResetEmail(email, resetCode, 'delivery');

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a verification code.'
    });
  } catch (error) {
    console.error('Delivery forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: 'An error occurred while processing your request'
    });
  }
});

// Delivery Verify Reset Code
router.post('/delivery/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and code are required'
      });
    }

    // Find delivery partner with valid code
    const delivery = await Delivery.findOne({
      email: email.toLowerCase(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!delivery) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Invalid or expired verification code'
      });
    }

    // Return the token for password reset
    res.json({
      success: true,
      message: 'Code verified successfully',
      token: delivery.resetPasswordToken
    });
  } catch (error) {
    console.error('Delivery verify reset code error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Delivery Verify Reset Token
router.get('/delivery/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Reset token is required'
      });
    }

    // Find delivery partner with valid token
    const delivery = await Delivery.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!delivery) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Delivery verify reset token error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Delivery Reset Password
router.post('/delivery/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Token and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Find delivery partner with valid token
    const delivery = await Delivery.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!delivery) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token and code
    delivery.password = hashedPassword;
    delivery.resetPasswordToken = null;
    delivery.resetPasswordCode = null;
    delivery.resetPasswordExpires = null;
    await delivery.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Delivery reset password error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: 'An error occurred while resetting password'
    });
  }
});

// Delivery Resend Verification Email
router.post('/delivery/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find delivery partner
    const delivery = await Delivery.findOne({ email: email.toLowerCase() });
    if (!delivery) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email'
      });
    }

    // Check if already verified
    if (delivery.isEmailVerified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'This email is already verified'
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    delivery.verificationToken = verificationToken;
    await delivery.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, 'delivery');

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error) {
    console.error('Delivery resend verification error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: 'An error occurred while sending verification email'
    });
  }
});

// Delivery Check Verification Status
router.get('/delivery/check-verification', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Find delivery partner
    const delivery = await Delivery.findOne({ email: email.toLowerCase() });
    if (!delivery) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email'
      });
    }

    res.json({
      success: true,
      isVerified: delivery.isEmailVerified
    });
  } catch (error) {
    console.error('Delivery check verification error:', error);
    res.status(500).json({
      error: 'Check failed',
      message: 'An error occurred while checking verification status'
    });
  }
});

// ============= ADMIN ROUTES =============

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Please provide username and password' 
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid username or password',
        field: 'username'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ 
        error: 'Account disabled',
        message: 'This admin account has been disabled'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid username or password',
        field: 'password'
      });
    }

    // Generate JWT token
    const token = generateToken(admin._id);

    // Remove password from response
    const adminObject = admin.toObject();
    delete adminObject.password;

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: adminObject
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login' 
    });
  }
});

// Admin Registration (for initial setup or adding new admins)
router.post('/admin/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide username, email, and password' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });
    
    if (existingAdmin) {
      return res.status(409).json({ 
        error: 'Admin already exists',
        message: 'This username or email is already registered',
        field: existingAdmin.username === username.toLowerCase() ? 'username' : 'email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await Admin.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      phone
    });

    // Remove password from response
    const adminObject = newAdmin.toObject();
    delete adminObject.password;

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      user: adminObject
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred during registration' 
    });
  }
});

export default router;