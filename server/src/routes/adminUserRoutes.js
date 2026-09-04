import { Router } from "express";
import { getUsers } from "../controllers/adminUserController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = Router();

router.get("/", adminAuthMiddleware, getUsers);

export default router;
