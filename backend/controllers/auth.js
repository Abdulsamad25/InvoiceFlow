import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/user.js";
import { sendEmail } from "../config/mail.js";
import { logAction } from "../utils/logger.js";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!role || !["ADMIN", "ACCOUNTANT"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role is required and must be ADMIN or ACCOUNTANT" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    await logAction(
      user._id,
      "user_registered",
      "user",
      user._id,
      "New user registered",
      req.ip,
    );

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await logAction(
      user._id,
      "user_login",
      "user",
      user._id,
      "User logged in",
      req.ip,
    );

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        signature: user.signature,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(user.email, "Password Reset Request", message);

    await logAction(
      user._id,
      "password_reset_requested",
      "user",
      user._id,
      "Password reset requested",
      req.ip,
    );

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await logAction(
      user._id,
      "password_reset_completed",
      "user",
      user._id,
      "Password reset completed",
      req.ip,
    );

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    await logAction(
      user._id,
      "profile_updated",
      "user",
      user._id,
      "Profile updated",
      req.ip,
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    await logAction(
      user._id,
      "password_changed",
      "user",
      user._id,
      "Password changed",
      req.ip,
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    await logAction(
      req.user.id,
      "user_role_updated",
      "user",
      user._id,
      `Role updated to ${role}`,
      req.ip,
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    await logAction(
      req.user.id,
      "user_deleted",
      "user",
      user._id,
      `User ${user.email} deleted`,
      req.ip,
    );

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadSignature = async (req, res) => {
  try {
    console.log("Starting signature upload...");
    console.log("File received:", req.file ? "Yes" : "No");
    console.log("User ID:", req.user?.id);
    console.log("User role:", req.user?.role);

    // Check if user is an accountant
    if (req.user.role !== "ACCOUNTANT") {
      return res.status(403).json({
        message: "Access denied. Only accountants can upload signatures.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check Cloudinary configuration
    console.log("Cloudinary config check:");
    console.log(
      "CLOUD_NAME:",
      process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Missing",
      "Value:",
      process.env.CLOUDINARY_CLOUD_NAME,
    );
    console.log(
      "API_KEY:",
      process.env.CLOUDINARY_API_KEY ? "Set" : "Missing",
      "Value:",
      process.env.CLOUDINARY_API_KEY,
    );
    console.log(
      "API_SECRET:",
      process.env.CLOUDINARY_API_SECRET ? "Set" : "Missing",
      "Value:",
      process.env.CLOUDINARY_API_SECRET,
    );

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary configuration missing");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Upload to Cloudinary
    console.log("Starting Cloudinary upload...");
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "signatures",
          public_id: `signature_${req.user.id}_${Date.now()}`,
          transformation: [
            { width: 300, height: 100, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload successful:", result.secure_url);
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    // Update user with signature URL
    console.log("Updating user with signature URL...");
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { signature: result.secure_url },
      { new: true },
    );

    console.log("User updated successfully:", user.signature);

    await logAction(
      req.user.id,
      "signature_uploaded",
      "user",
      req.user.id,
      "User uploaded signature",
      req.ip,
    );

    res.json({
      success: true,
      message: "Signature uploaded successfully",
      signature: result.secure_url,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        signature: user.signature,
      },
    });
  } catch (error) {
    console.error("Signature upload error:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ message: "Error uploading signature", error: error.message });
  }
};
