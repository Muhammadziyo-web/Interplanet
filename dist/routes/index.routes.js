import express from "express";
import userRoutes from "./user.routes.js";
import postsRoutes from "./posts.routes.js";
const router = express.Router();
router.use('/test', () => { });
router.use("/user", userRoutes);
router.use("/posts", postsRoutes);
export default router;
