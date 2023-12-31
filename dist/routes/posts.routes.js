import { Router } from "express";
import postsContr from "../controllers/posts.contr.js";
import userMiddleware from "../middleware/user.middleware.js";
let { post, getAll, getById, getByToken, put, delete: del, like } = postsContr;
let { tokenChecker, IdChecker } = userMiddleware;
const router = Router();
router.get("/", tokenChecker, getByToken);
router.get("/getById/:id", tokenChecker, IdChecker, getById);
router.get("/getAll", tokenChecker, getAll);
router.post("/", tokenChecker, post);
router.put("/:id", tokenChecker, IdChecker, put);
router.get("/:id/like", tokenChecker, IdChecker, like);
router.delete("/:id", tokenChecker, IdChecker, del);
export default router;
