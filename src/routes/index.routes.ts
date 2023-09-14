import express from "express";
import userRoutes from "./user.routes.js"
import postsRoutes from "./posts.routes.js"
import commentsRoutes from "./comments.routes.js"
import jobRoutes from "./job.routes.js"

const router = express.Router();
router.use("/user", userRoutes);
router.use("/posts", postsRoutes);
router.use("/comments", commentsRoutes);
router.use("/job", jobRoutes);

export default router
