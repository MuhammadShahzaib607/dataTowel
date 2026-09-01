import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { getFirebaseAdminAuth } from "../config/firebaseAdmin.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Generate 6-digit OTP using crypto
function generateOtp() {
  const buffer = crypto.randomBytes(4);
  const otp = (buffer.readUInt32BE(0) % 1_000_000).toString().padStart(6, "0");
  return otp;
}

// Hash OTP using SHA-256
function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// Helper: send verification email async (fire-and-forget)
function fireSendVerificationEmail(email, username, otp) {
  sendVerificationEmail(email, username, otp).catch((error) => {
    console.error("Verification email failed to send:", error.message);
  });
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Prevent Google-authenticated users from registering with password
    const existingGoogleUser = await User.findOne({ email, authProvider: "google" });
    if (existingGoogleUser) {
      return res.status(400).json({
        success: false,
        message: "This email is linked to a Google account. Please sign in with Google.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Generate OTP before creating user
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (isVerified defaults to false)
    const user = await User.create({
      username,
      email,
      password,
      emailVerificationOtpHash: otpHash,
      emailVerificationOtpExpires: otpExpires,
    });

    // Send response immediately
    res.status(201).json({
      success: true,
      message: "Verification code sent",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: false,
      },
      needsVerification: true,
    });

    // Send email asynchronously (after response)
    fireSendVerificationEmail(email, username, otp);
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and verification code",
      });
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationOtpHash +emailVerificationOtpExpires"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification request",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
    }

    // Check expiry
    if (new Date() > user.emailVerificationOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Compare OTP
    const submittedHash = hashOtp(otp);
    if (submittedHash !== user.emailVerificationOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // OTP is correct - verify user
    user.isVerified = true;
    user.emailVerificationOtpHash = undefined;
    user.emailVerificationOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        message: "If an account with that email exists, a new code has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP (invalidates any previous one)
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationOtpHash = otpHash;
    user.emailVerificationOtpExpires = otpExpires;
    await user.save();

    // Respond immediately, send email async
    res.json({
      success: true,
      message: "Verification code resent",
    });

    fireSendVerificationEmail(email, user.username, otp);
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before signing in.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// POST /api/auth/google
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    // Verify the Firebase ID token server-side
    let decodedToken;
    try {
      decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google authentication. Please try again.",
      });
    }

    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "No email found in Google account",
      });
    }

    // Check if user already exists by email
    let user = await User.findOne({ email });

    if (user) {
      // Existing user — link Google info safely, don't overwrite password or username
      if (!user.googleId) {
        user.googleId = uid;
      }
      if (!user.authProvider || user.authProvider === "local") {
        user.authProvider = "google";
      }
      // Mark verified if Google confirms it
      if (email_verified) {
        user.isVerified = true;
      }
      // Update profile image only if user doesn't have one
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      await user.save();
    } else {
      // Create new user from Google
      const username = name?.trim() || email.split("@")[0];

      user = await User.create({
        username,
        email,
        password: null, // No password for Google users
        isVerified: email_verified === true,
        isAdmin: false,
        authProvider: "google",
        googleId: uid,
        profileImage: picture || "",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Google sign-in successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};
