import { Router } from "express";
import {
  getBankDetails,
  createBankDetails,
  updateBankDetails,
} from "../controllers/bankDetailsController.js";
import {
  getDeliverySettings,
  updateDeliverySettings,
} from "../controllers/deliverySettingsController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = Router();

// All settings routes require admin auth
router.use(adminAuthMiddleware);

// Bank Details
router.get("/bank-details", getBankDetails);
router.post("/bank-details", createBankDetails);
router.put("/bank-details", updateBankDetails);

// Delivery Charges
router.get("/delivery", getDeliverySettings);
router.put("/delivery", updateDeliverySettings);

export default router;
