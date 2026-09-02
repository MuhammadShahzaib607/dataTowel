import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  toggleOrderStatus,
  getOrderStats,
  verifyPayment,
  rejectPayment,
  updateOrderStatus,
} from "../controllers/orderController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = Router();

// All order management routes require admin auth
router.use(adminAuthMiddleware);

router.get("/stats", getOrderStats);
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.patch("/:id/status", toggleOrderStatus);
router.patch("/:id/verify-payment", verifyPayment);
router.patch("/:id/reject-payment", rejectPayment);
router.patch("/:id/order-status", updateOrderStatus);

export default router;
