import { Router } from "express";
import commentsContr from "../controllers/comments.contr.js";
import userMiddleware from "../middleware/user.middleware.js";
let { tokenChecker, IdChecker } = userMiddleware;
const router = Router();
let { delete: del, get, post, put } = commentsContr

router.get("/:id", tokenChecker, IdChecker, get);
router.post("/:id", tokenChecker, IdChecker, post);
router.put("/:id", tokenChecker, IdChecker, put);
router.delete("/:id", tokenChecker,IdChecker, del);


export default router;
