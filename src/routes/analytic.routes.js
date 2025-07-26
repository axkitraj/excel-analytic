import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { handleAnalyticsUpload } from "../controllers/analytic.controller.js";

const analyticRouter = express.Router();

analyticRouter.post("/", protect, upload.single("file"), handleAnalyticsUpload);

export default analyticRouter;
