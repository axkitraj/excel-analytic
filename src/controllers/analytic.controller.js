import File from "../models/file.model.js";
import Analytic from "../models/analytic.model.js";
import User from "../models/user.model.js";
import { generateInsight } from "../services/ai.service.js";
import { parseCsvExcelFile } from "../utils/parse.js";

export const handleAnalyticsUpload = async (req, res, next) => {
    try {
        const { file } = req;
        const userId = req.user.id;

        if (!file) return res.status(400).json({ msg: "No file uploaded." });

        const jsonData = await parseCsvExcelFile(file.path);
        const insightsText = await generateInsight(jsonData.slice(0, 15));
        const insights = insightsText.split("\n").map(line => line.trim()).filter(Boolean);

        const savedFile = await File.create({
            userId: userId,
            filename: file.filename,
            originalName: file.originalname,
            data: jsonData,
            mimeType: file.mimetype,
            size: file.size,
        });

        const analytic = await Analytic.create({
            userId,
            fileId: savedFile._id,
            preview: jsonData.slice(0, 20),
            insights,
        });

        await User.findByIdAndUpdate(userId, {
            $push: {
                files: savedFile._id,
                analytics: analytic._id,
            },
        });

        res.status(200).json({
            file: {
                originalName: file.originalname,
                filename: file.filename,
                size: file.size,
            },
            analytic: {
                preview: analytic.preview,
                insights: analytic.insights,
            },
        });
    } catch (e) { next(e) }
};