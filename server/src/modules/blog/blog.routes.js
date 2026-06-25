import express from "express";
import jwt from "jsonwebtoken";
import { protect } from "../../middleware/auth.middleware.js";
import upload from "../../middleware/upload.middleware.js";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  likeBlog,
  createBlogComment,
  createBlogReply,
  getBlogComments,
  deleteBlogComment,
  shareBlog,
  getTrendingBlogs,
} from "./blog.controller.js";

const router = express.Router();

// Helper middleware for optional authentication on browse/read routes
const optionalProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid tokens and proceed as guest
    }
  }
  next();
};

// BLOGS MAIN CRUD
router.get("/", optionalProtect, getBlogs);
router.get("/trending", getTrendingBlogs);
router.get("/:id", optionalProtect, getBlogById);
router.post("/", protect, upload.any(), createBlog);
router.put("/:id", protect, upload.any(), updateBlog);
router.delete("/:id", protect, deleteBlog);

// INTERACTIONS
router.post("/:id/like", protect, likeBlog);
router.delete("/:id/like", protect, likeBlog); // REST Toggle convenience
router.post("/:id/share", optionalProtect, shareBlog);

// COMMENTS
router.get("/:id/comments", getBlogComments);
router.post("/:id/comments", protect, createBlogComment);
router.post("/:id/comments/:commentId/reply", protect, createBlogReply);
router.delete("/comments/:commentId", protect, deleteBlogComment);

export default router;
