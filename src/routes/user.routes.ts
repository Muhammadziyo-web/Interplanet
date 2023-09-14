import { Router } from "express";
import userContr from "../controllers/user.contr.js";
import userMiddleware from "../middleware/user.middleware.js";
let { get,post, login, put,getAll,getById } = userContr;
let { tokenChecker,IdChecker } = userMiddleware;
const router = Router();

router.get("/", tokenChecker, get);
router.get("/getById/:id", tokenChecker,IdChecker, getById);
router.get("/getAll",tokenChecker, getAll);
router.post("/", post);
router.put("/", tokenChecker, put);
router.post("/login", login);

// router.delete("/", authMiddleware, del);

export default router;