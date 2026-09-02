import { Router } from "express";
import {
  getBankDetails,
  createBankDetails,
  updateBankDetails,
} from "../controllers/bankDetailsController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = Router();

// All settings routes require admin auth
router.use(adminAuthMiddleware);

router.get("/bank-details", getBankDetails);
router.post("/bank-details", createBankDetails);
router.put("/bank-details", updateBankDetails);

export default router;
