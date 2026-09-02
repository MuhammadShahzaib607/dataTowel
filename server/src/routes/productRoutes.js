import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  uploadProductImages,
  deleteProductImage,
} from "../controllers/productController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

// All product management routes require admin auth
router.use(adminAuthMiddleware);

router.post("/", upload.array("images", 10), createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", upload.array("images", 10), updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/status", toggleProductStatus);
router.post("/:id/images", upload.array("images", 10), uploadProductImages);
router.delete("/:id/images/:publicId", deleteProductImage);

export default router;
