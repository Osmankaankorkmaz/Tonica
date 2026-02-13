const express = require("express");

const {
  listBlogPosts,
  getBlogPostByUid,
  getBlogPostBySlug,
  adminListBlogPosts,
  createBlogPost,
  updateBlogPost,
  softDeleteBlogPost,
  publishBlogPost,
  scheduleBlogPost,
  adminGetBlogPostByUid,
} = require("../controllers/blog.js");

const { authenticationMid } = require("../middleware/auth.js");
const { uploadSingleCover } = require("../middleware/upload.js");

const router = express.Router();

// PUBLIC
router.get("/blog", listBlogPosts);
router.get("/blog/slug/:slug", getBlogPostBySlug);
router.get("/blog/:uid", getBlogPostByUid);

// ADMIN
router.get("/blog/admin/list", authenticationMid, adminListBlogPosts);
router.get("/blog/admin/:uid", authenticationMid, adminGetBlogPostByUid);

// COVER UPLOAD (multer memoryStorage) + CONTROLLER
router.post("/blog/admin", authenticationMid, uploadSingleCover, createBlogPost);
router.patch("/blog/admin/:uid", authenticationMid, uploadSingleCover, updateBlogPost);

// DELETE / PUBLISH / SCHEDULE
router.delete("/blog/admin/:uid", authenticationMid, softDeleteBlogPost);
router.post("/blog/admin/:uid/publish", authenticationMid, publishBlogPost);
router.post("/blog/admin/:uid/schedule", authenticationMid, scheduleBlogPost);

module.exports = router;
