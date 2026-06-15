/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import api from "./api";
import { toast } from "react-toastify";

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome back, ${user.name}!`);
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Account created successfully!");
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("You have been logged out.");
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email.");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });
      toast.success("Password reset successful. Please login.");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getAllUsers: async () => {
    try {
      const response = await api.get("/auth/users");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/auth/users/${userId}/role`, { role });
      toast.success("User role updated successfully");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/auth/users/${userId}`);
      toast.success("User deleted successfully");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadSignature: async (signatureFile) => {
    try {
      const formData = new FormData();
      formData.append("signature", signatureFile);

      const response = await api.post("/auth/upload-signature", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local storage with new user data
      const { user } = response.data;
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Signature uploaded successfully!");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
