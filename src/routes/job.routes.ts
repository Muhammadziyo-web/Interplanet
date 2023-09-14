import { Router } from "express";
import jobContr from "../controllers/job.contr.js";
import userMiddleware from "../middleware/user.middleware.js";
let { getByToken, post, put, getAll, getById } = jobContr;
let { tokenChecker, IdChecker } = userMiddleware;
const router = Router();

router.get("/", tokenChecker, getByToken);
router.get("/getById/:id", tokenChecker, IdChecker, getById);
router.get("/getAll", tokenChecker, getAll);
router.post("/",tokenChecker, post);
router.put("/:id", tokenChecker, IdChecker, put);

// router.delete("/", authMiddleware, del);

export default router;
