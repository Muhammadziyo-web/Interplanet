import express from "express";
import userRoutes from "./user.routes.js"
const router = express.Router();
router.use('/test', () => { });
router.use("/user", userRoutes);

export default router
