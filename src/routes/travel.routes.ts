import { Router } from "express";
import travelContr from "../controllers/travel.contr.js";
import userMiddleware from "../middleware/user.middleware.js";
let { post, getAll, getById, getByToken, put } = travelContr;

let { tokenChecker, IdChecker } = userMiddleware;
const router = Router();

router.get("/", tokenChecker, getByToken);
router.get("/getById/:id", tokenChecker, IdChecker, getById);
router.get("/getAll", tokenChecker, getAll);
router.post("/", tokenChecker, post);
router.put("/:id", tokenChecker, IdChecker, put);

export default router;
