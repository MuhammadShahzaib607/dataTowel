import { Router } from "express";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
} from "../controllers/blogController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

// All blog management routes require admin auth
router.use(adminAuthMiddleware);

router.post("/", upload.array("images", 10), createBlog);
router.get("/", getBlogs);
router.get("/:id", getBlog);
router.put("/:id", upload.array("images", 10), updateBlog);
router.delete("/:id", deleteBlog);
router.patch("/:id/status", toggleBlogStatus);

export default router;
