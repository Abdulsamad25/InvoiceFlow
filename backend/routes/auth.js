import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
  uploadSignature,
} from "../controllers/auth.js";
import { protect, authorize } from "../middlewares/auth.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validators/auth.js";
import multer from "multer";

// Configure multer for signature upload
const signatureUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post(
  "/reset-password/:resetToken",
  resetPasswordValidation,
  resetPassword,
);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post(
  "/upload-signature",
  protect,
  signatureUpload.single("signature"),
  uploadSignature,
);
router.put("/change-password", protect, changePassword);

// Only ADMIN can manage users
router.get("/users", protect, authorize("ADMIN"), getAllUsers);
router.put("/users/:id/role", protect, authorize("ADMIN"), updateUserRole);
router.delete("/users/:id", protect, authorize("ADMIN"), deleteUser);

export default router;
