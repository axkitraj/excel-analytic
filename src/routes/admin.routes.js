import { Router } from "express";
import {
    adminLogin,
    verifyAdminToken,
    getDashboardStats,
    getAllUsers,
    getUserById,
    deleteUser,
    getUserStats,
    getAllAnalytics,
    getAnalyticsById,
    deleteAnalytics,
    getAnalyticsStats,
    getAllFiles,
    getFileById,
    deleteFile,
    getFileStats,
    getSystemHealth,
    getActivityLogs
} from "../controllers/admin.controller.js";
import adminProtect from "../middlewares/admin.middleware.js";

const adminRoutes = Router();

// Public admin routes
adminRoutes.post("/login", adminLogin);

// Protected admin routes
adminRoutes.use(adminProtect); // All routes below require admin authentication

// Admin verification
adminRoutes.get("/verify", verifyAdminToken);

// Dashboard
adminRoutes.get("/dashboard/stats", getDashboardStats);

// Users management
adminRoutes.get("/users", getAllUsers);
adminRoutes.get("/users/stats", getUserStats);
adminRoutes.get("/users/:userId", getUserById);
adminRoutes.delete("/users/:userId", deleteUser);

// Analytics management
adminRoutes.get("/analytics", getAllAnalytics);
adminRoutes.get("/analytics/stats", getAnalyticsStats);
adminRoutes.get("/analytics/:analyticsId", getAnalyticsById);
adminRoutes.delete("/analytics/:analyticsId", deleteAnalytics);

// Files management
adminRoutes.get("/files", getAllFiles);
adminRoutes.get("/files/stats", getFileStats);
adminRoutes.get("/files/:fileId", getFileById);
adminRoutes.delete("/files/:fileId", deleteFile);

// System management
adminRoutes.get("/system/health", getSystemHealth);
adminRoutes.get("/activity-logs", getActivityLogs);

export default adminRoutes;
