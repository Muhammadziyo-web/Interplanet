import { Router } from "express";
import userContr from "../controllers/user.contr.js";
import userMiddleware from "../middleware/user.middleware.js";
let { get,post, login, put } = userContr;
let { tokenChecker } = userMiddleware;
const router = Router();

router.get("/", tokenChecker, get);
router.post("/", post);
router.put("/", tokenChecker, put);
router.post("/login", login);
// router.delete("/", authMiddleware, del);

export default router;