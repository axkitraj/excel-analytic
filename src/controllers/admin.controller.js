import User from "../models/user.model.js";
import File from "../models/file.model.js";
import Analytic from "../models/analytic.model.js";
import { hash, compare } from "../utils/hash.js";
import { sign, verify } from "../utils/jwt.js";

// Admin Authentication
export const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email and password are required" 
            });
        }

        // Check if user exists and is admin
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        // For demo purposes, we'll allow any user with email containing 'admin' to be admin
        // In production, you'd have a proper role field
        if (!email.includes('admin')) {
            return res.status(403).json({ 
                success: false,
                message: "Admin access required" 
            });
        }

        if (!(await compare(password, user.password))) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        const token = sign({ id: user._id, role: 'admin' }, "7d");

        res.json({ 
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: 'admin'
            },
            message: "Admin login successful"
        });
    } catch (error) { 
        console.error('Admin login error:', error);
        next(error); 
    }
};

export const verifyAdminToken = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Admin user not found' 
            });
        }

        res.json({ 
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: 'admin'
            }
        });
    } catch (error) { 
        next(error); 
    }
};

// Dashboard Stats
export const getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalFiles,
            totalAnalytics,
            activeUsers
        ] = await Promise.all([
            User.countDocuments(),
            File.countDocuments(),
            Analytic.countDocuments(),
            User.countDocuments({ 
                lastLogin: { 
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
                } 
            })
        ]);

        const stats = {
            totalUsers,
            totalFiles,
            totalAnalytics,
            activeUsers,
            systemHealth: 'good'
        };

        res.json({ 
            success: true,
            data: stats
        });
    } catch (error) { 
        console.error('Dashboard stats error:', error);
        next(error); 
    }
};

// Users Management
export const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = search ? {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const [users, totalUsers] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('files', 'filename createdAt')
                .populate('analytics', 'createdAt'),
            User.countDocuments(query)
        ]);

        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            status: 'active', // You can add status field to User model
            createdAt: user.createdAt,
            filesCount: user.files?.length || 0,
            analyticsCount: user.analytics?.length || 0
        }));

        res.json({
            success: true,
            data: {
                users: formattedUsers,
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .select('-password')
            .populate('files', 'filename originalName createdAt size')
            .populate('analytics', 'createdAt insights');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const formattedUser = {
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            status: 'active',
            createdAt: user.createdAt,
            files: user.files || [],
            analytics: user.analytics || []
        };

        res.json({
            success: true,
            data: formattedUser
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Also delete user's files and analytics
        await Promise.all([
            File.deleteMany({ userId }),
            Analytic.deleteMany({ userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        next(error);
    }
};

export const getUserStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            activeUsers,
            newUsersToday,
            avgFilesPerUser
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ 
                lastLogin: { 
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
                } 
            }),
            User.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }),
            File.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFiles: { $sum: 1 },
                        uniqueUsers: { $addToSet: "$userId" }
                    }
                },
                {
                    $project: {
                        avgFilesPerUser: {
                            $divide: ["$totalFiles", { $size: "$uniqueUsers" }]
                        }
                    }
                }
            ])
        ]);

        const stats = {
            totalUsers,
            activeUsers,
            newUsersToday,
            avgFilesPerUser: avgFilesPerUser[0]?.avgFilesPerUser || 0
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('User stats error:', error);
        next(error);
    }
};

// Analytics Management
export const getAllAnalytics = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.query.userId;
        const skip = (page - 1) * limit;

        const query = userId ? { userId } : {};

        const [analytics, totalAnalytics] = await Promise.all([
            Analytic.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'firstName lastName email')
                .populate('fileId', 'filename originalName'),
            Analytic.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                analytics,
                totalAnalytics,
                totalPages: Math.ceil(totalAnalytics / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Get all analytics error:', error);
        next(error);
    }
};

export const getAnalyticsById = async (req, res, next) => {
    try {
        const { analyticsId } = req.params;
        
        const analytics = await Analytic.findById(analyticsId)
            .populate('userId', 'firstName lastName email')
            .populate('fileId', 'filename originalName data');

        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: 'Analytics not found'
            });
        }

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Get analytics by ID error:', error);
        next(error);
    }
};

export const deleteAnalytics = async (req, res, next) => {
    try {
        const { analyticsId } = req.params;
        
        const analytics = await Analytic.findByIdAndDelete(analyticsId);
        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: 'Analytics not found'
            });
        }

        res.json({
            success: true,
            message: 'Analytics deleted successfully'
        });
    } catch (error) {
        console.error('Delete analytics error:', error);
        next(error);
    }
};

export const getAnalyticsStats = async (req, res, next) => {
    try {
        const [
            totalAnalytics,
            analyticsThisMonth,
            analyticsToday,
            avgAnalyticsPerUser
        ] = await Promise.all([
            Analytic.countDocuments(),
            Analytic.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }),
            Analytic.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }),
            Analytic.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAnalytics: { $sum: 1 },
                        uniqueUsers: { $addToSet: "$userId" }
                    }
                },
                {
                    $project: {
                        avgAnalyticsPerUser: {
                            $divide: ["$totalAnalytics", { $size: "$uniqueUsers" }]
                        }
                    }
                }
            ])
        ]);

        const stats = {
            totalAnalytics,
            analyticsThisMonth,
            analyticsToday,
            avgAnalyticsPerUser: avgAnalyticsPerUser[0]?.avgAnalyticsPerUser || 0,
            growthPercentage: 23 // You can calculate actual growth percentage
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Analytics stats error:', error);
        next(error);
    }
};

// Files Management
export const getAllFiles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.query.userId;
        const skip = (page - 1) * limit;

        const query = userId ? { userId } : {};

        const [files, totalFiles] = await Promise.all([
            File.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'firstName lastName email'),
            File.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                files,
                totalFiles,
                totalPages: Math.ceil(totalFiles / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Get all files error:', error);
        next(error);
    }
};

export const getFileById = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        
        const file = await File.findById(fileId)
            .populate('userId', 'firstName lastName email');

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.json({
            success: true,
            data: file
        });
    } catch (error) {
        console.error('Get file by ID error:', error);
        next(error);
    }
};

export const deleteFile = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        
        const file = await File.findByIdAndDelete(fileId);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Also delete related analytics
        await Analytic.deleteMany({ fileId });

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        next(error);
    }
};

export const getFileStats = async (req, res, next) => {
    try {
        const [
            totalFiles,
            totalSize,
            filesThisMonth
        ] = await Promise.all([
            File.countDocuments(),
            File.aggregate([
                {
                    $group: {
                        _id: null,
                        totalSize: { $sum: "$size" }
                    }
                }
            ]),
            File.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            })
        ]);

        const stats = {
            totalFiles,
            totalSize: totalSize[0]?.totalSize || 0,
            filesThisMonth,
            growth: 18 // You can calculate actual growth percentage
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('File stats error:', error);
        next(error);
    }
};

// System Health
export const getSystemHealth = async (req, res, next) => {
    try {
        // Basic system health check
        const health = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            status: 'healthy'
        };

        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        console.error('System health error:', error);
        next(error);
    }
};

// Activity Logs (mock implementation)
export const getActivityLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // This is a mock implementation
        // In a real app, you'd have a logs collection
        const logs = [
            {
                _id: '1',
                timestamp: new Date(),
                level: 'info',
                action: 'User Login',
                details: 'User admin@demo.com logged in',
                userId: 'system',
                ipAddress: '127.0.0.1'
            },
            {
                _id: '2',
                timestamp: new Date(Date.now() - 300000),
                level: 'info',
                action: 'File Upload',
                details: 'File uploaded: data.csv',
                userId: 'user123',
                ipAddress: '192.168.1.100'
            }
        ];

        res.json({
            success: true,
            data: {
                logs,
                totalLogs: logs.length,
                totalPages: 1,
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Activity logs error:', error);
        next(error);
    }
};
