import { Router } from "express";
import {
    createUser,
    connectUser,
    requestReset,
    confirmReset,
    getUser,
    updateUser,
} from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

const authRoutes = Router();
authRoutes
    .get("/", protect, getUser)
    .put("/", protect, updateUser)
    .post("/register", createUser)
    .post("/login", connectUser)
    .post("/forgot-password", requestReset)
    .post("/reset-password/:token", confirmReset);
export default authRoutes;