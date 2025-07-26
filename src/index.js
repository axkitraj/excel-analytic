// 🌐 Core Imports
import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import colors from 'colors';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔌 Configs & Routes
import connectDB from './configs/db.js';
import errorHandler from './middlewares/error.middleware.js';
import authRouter from './routes/auth.routes.js';
import analyticRouter from './routes/analytic.routes.js';
import adminRoutes from './routes/admin.routes.js';

// ⚙️ Init Environment & DB
dotenv.config();
connectDB();

// 📂 __dirname setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Express App Init
const app = express();

// 🔒 Security & Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log('🚧 Development mode active'.yellow.bold);
}

// 📡 API Routes
console.log('🔗 Registering API routes...');
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticRouter);
app.use('/api/admin', adminRoutes);

// 🖼️ Serve React Vite Build
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// 🎯 SPA Fallback for React Router (excluding /api/*)
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'), err => {
        if (err) {
            console.error('❌ Failed to serve React entry:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// 🧯 Centralized Error Handler
app.use(errorHandler);

// 🔊 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on `.green + `http://localhost:${PORT}`.magenta.bold);
});