const BlogPost = require("../models/blog.js");
const ApiError = require("../error/ApiError.js");
const { v2: cloudinary } = require("cloudinary");

/** Cloudinary config */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

/** ---------- Helpers ---------- */
const normalizeUid = (u) => String(u || "").trim();

const requireAuth = (req) => {
  if (!req.user?.id) throw new ApiError("Yetkisiz.", 401);
  return req.user.id;
};

const hasRole = (req, roles = []) => {
  const r = req.user?.roles || [];
  return roles.some((x) => r.includes(x));
};

const canManagePosts = (req) => hasRole(req, ["admin", "editor"]);

const pickPublicFields = (doc) => {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    uid: d.uid,
    title: d.title || "",
    slug: d.slug || "",
    summary: d.summary || "",
    content: d.content || "",
    seo: d.seo || { metaTitle: "", metaDescription: "", keywords: [] },
    category: d.category || "blog",
    tags: d.tags || [],
    status: d.status,
    featured: !!d.featured,
    coverImage: d.coverImage || null,
    author: d.author || null,
    readingTime: d.readingTime || 1,
    stats: d.stats || { views: 0, likes: 0, commentsCount: 0 },
    publishedAt: d.publishedAt || null,
    scheduledAt: d.scheduledAt || null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
};

const buildPublicQuery = () => ({
  isDeleted: { $ne: true },
  status: "published",
  publishedAt: { $lte: new Date() },
});

const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limitRaw = parseInt(req.query.limit || "12", 10);
  const limit = Math.min(50, Math.max(1, limitRaw));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const safeJsonParse = (v, fallback) => {
  try {
    if (v === undefined || v === null) return fallback;
    if (typeof v === "object") return v;
    const s = String(v).trim();
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

const parseTags = (tags) => {
  if (Array.isArray(tags))
    return tags.map((x) => String(x).trim()).filter(Boolean);

  if (typeof tags === "string") {
    const asJson = safeJsonParse(tags, null);
    if (Array.isArray(asJson))
      return asJson.map((x) => String(x).trim()).filter(Boolean);

    return tags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
};

/** Buffer -> Cloudinary upload */
const uploadToCloudinary = async (file, opts = {}) => {
  if (!file?.buffer) throw new ApiError("Resim dosyası okunamadı.", 400);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder || "blog_covers",
        resource_type: "image",
        overwrite: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

const destroyFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {}
};

/** =========================
 *  PUBLIC
 * ========================= */

const listBlogPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);

    const tag = String(req.query.tag || "").trim().toLowerCase();
    const featured = String(req.query.featured || "").trim() === "1";
    const q = String(req.query.q || "").trim();
    const sort = String(req.query.sort || "latest").trim();

    const filter = {
      ...buildPublicQuery(),
      ...(featured ? { featured: true } : {}),
      ...(tag ? { tags: tag } : {}),
    };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
      ];
    }

    let sortObj = { publishedAt: -1 };
    if (sort === "popular") sortObj = { "stats.views": -1, publishedAt: -1 };

    const [items, total] = await Promise.all([
      BlogPost.find(filter).sort(sortObj).skip(skip).limit(limit),
      BlogPost.countDocuments(filter),
    ]);

    return res.status(200).json({
      items: items.map(pickPublicFields),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return next(err);
  }
};

const getBlogPostByUid = async (req, res, next) => {
  try {
    const uid = normalizeUid(req.params.uid);
    if (!uid) return next(new ApiError("uid gerekli.", 400));

    const incView = String(req.query.incView || "0") === "1";

    const post = await BlogPost.findOne({ uid, ...buildPublicQuery() });
    if (!post) return next(new ApiError("Blog yazısı bulunamadı.", 404));

    if (incView) {
      await BlogPost.updateOne({ uid }, { $inc: { "stats.views": 1 } }).catch(() => {});
      post.stats = post.stats || {};
      post.stats.views = (post.stats.views || 0) + 1;
    }

    return res.status(200).json({ item: pickPublicFields(post) });
  } catch (err) {
    return next(err);
  }
};

const getBlogPostBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    if (!slug) return next(new ApiError("slug gerekli.", 400));

    const incView = String(req.query.incView || "0") === "1";

    const post = await BlogPost.findOne({ slug, ...buildPublicQuery() });
    if (!post) return next(new ApiError("Blog yazısı bulunamadı.", 404));

    if (incView) {
      await BlogPost.updateOne({ uid: post.uid }, { $inc: { "stats.views": 1 } }).catch(() => {});
      post.stats = post.stats || {};
      post.stats.views = (post.stats.views || 0) + 1;
    }

    return res.status(200).json({ item: pickPublicFields(post) });
  } catch (err) {
    return next(err);
  }
};

/** =========================
 *  ADMIN/EDITOR
 * ========================= */

const adminListBlogPosts = async (req, res, next) => {
  try {
    requireAuth(req);
    if (!canManagePosts(req)) return next(new ApiError("Yetkisiz.", 403));

    const { page, limit, skip } = parsePagination(req);
    const status = String(req.query.status || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = { isDeleted: { $ne: true } };
    if (status) filter.status = status;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      BlogPost.countDocuments(filter),
    ]);

    return res.status(200).json({
      items: items.map(pickPublicFields),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return next(err);
  }
};

const createBlogPost = async (req, res, next) => {
  try {
    requireAuth(req);
    if (!canManagePosts(req)) return next(new ApiError("Yetkisiz.", 403));

    const body = req.body || {};
    if (!body?.title || !body?.content)
      return next(new ApiError("title ve content zorunludur.", 400));

    const seo = safeJsonParse(body.seo, {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    });
    const tags = parseTags(body.tags);
    const featured =
      String(body.featured || "").toLowerCase() === "true" ||
      body.featured === true;

    // cover upload
    let coverImage = null;
    if (req.file) {
      const up = await uploadToCloudinary(req.file, { folder: "blog_covers" });
      coverImage = {
        url: up.secure_url,
        public_id: up.public_id,
        alt: body.coverAlt || "",
      };
    }

    const status = body.status || "draft";
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    const publishedAt = status === "published" ? new Date() : null;

    const post = await BlogPost.create({
      title: body.title,
      slug: body.slug,
      summary: body.summary || "",
      content: body.content,
      seo,

      coverImage,
      category: body.category || "blog",
      tags,
      featured,

      status,
      scheduledAt: status === "scheduled" ? scheduledAt : null,
      publishedAt,

      author: {
        uid: req.user?.uid || "",
        name: req.user?.name || req.user?.username || "",
        email: req.user?.email || "",
      },

      stats: { views: 0, likes: 0, commentsCount: 0 },
      isDeleted: false,
    });

    return res.status(201).json({ item: pickPublicFields(post) });
  } catch (err) {
    if (err?.code === 11000)
      return next(new ApiError("Slug zaten kullanılıyor.", 409));
    return next(err);
  }
};

const updateBlogPost = async (req, res, next) => {
  try {
    requireAuth(req);
    if (!canManagePosts(req)) return next(new ApiError("Yetkisiz.", 403));

    const uid = normalizeUid(req.params.uid);
    if (!uid) return next(new ApiError("uid gerekli.", 400));

    const patch = req.body || {};
    const post = await BlogPost.findOne({ uid });
    if (!post) return next(new ApiError("Blog yazısı bulunamadı.", 404));

    const allowed = [
      "title",
      "slug",
      "summary",
      "content",
      "seo",
      "tags",
      "featured",
      "category",
      "status",
      "scheduledAt",
    ];

    for (const k of Object.keys(patch)) {
      if (!allowed.includes(k)) continue;

      if (k === "seo") post.seo = safeJsonParse(patch.seo, post.seo);
      else if (k === "tags") post.tags = parseTags(patch.tags);
      else if (k === "featured") {
        post.featured =
          String(patch.featured).toLowerCase() === "true" ||
          patch.featured === true;
      } else if (k === "scheduledAt") {
        post.scheduledAt = patch.scheduledAt
          ? new Date(patch.scheduledAt)
          : null;
      } else {
        post[k] = patch[k];
      }
    }

    if (String(post.status) === "published" && !post.publishedAt) {
      post.publishedAt = new Date();
      post.scheduledAt = null;
    }

    if (String(post.status) === "scheduled") {
      post.publishedAt = null;
    }

    const coverRemove = String(patch.coverRemove || "0") === "1";
    if (coverRemove && post.coverImage?.public_id) {
      await destroyFromCloudinary(post.coverImage.public_id);
      post.coverImage = null;
    }

    if (req.file) {
      if (post.coverImage?.public_id)
        await destroyFromCloudinary(post.coverImage.public_id);

      const up = await uploadToCloudinary(req.file, { folder: "blog_covers" });
      post.coverImage = {
        url: up.secure_url,
        public_id: up.public_id,
        alt: patch.coverAlt || "",
      };
    } else if (typeof patch.coverAlt === "string" && post.coverImage) {
      post.coverImage.alt = patch.coverAlt;
    }

    await post.save();
    return res.status(200).json({ item: pickPublicFields(post) });
  } catch (err) {
    if (err?.code === 11000)
      return next(new ApiError("Slug zaten kullanılıyor.", 409));
    return next(err);
  }
};

const softDeleteBlogPost = async (req, res, next) => {
  try {
    requireAuth(req);
    if (!canManagePosts(req)) return next(new ApiError("Yetkisiz.", 403));

    const uid = normalizeUid(req.params.uid);
    if (!uid) return next(new ApiError("uid gerekli.", 400));

    const post = await BlogPost.findOne({ uid });
    if (!post) return next(new ApiError("Blog yazısı bulunamadı.", 404));

    if (post.coverImage?.public_id)
      await destroyFromCloudinary(post.coverImage.public_id);

    post.isDeleted = true;
    post.deletedAt = new Date();
    post.coverImage = null;

    await post.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Silindi (soft).", uid });
  } catch (err) {
    return next(err);
  }
};

const publishBlogPost = async (req, res, next) => {
  try {
    requireAuth(req);
    if (!canManagePosts(req)) return next(new ApiError("Yetkisiz.", 403));

    const uid = normalizeUid(req.params.uid);
    if (!uid) return next(new ApiError("uid gerekli.", 400));

    const post = await BlogPost.findOne({ uid });
    if (!post) return next(new ApiError("Blog yazısı bulunamadı.", 404));

    post.status = "published";
    post.scheduledAt = null;
    post.publishedAt = new Date();

    await post.save();
    return res.status(200).json({ item: pickPublicFields(post) });
  } catch (err) {
    return next(err);
  }
};

const scheduleBlogPost = async (req, res, next) => {
  try {
    requireAuth(req);
    if (!canManagePosts(req)) return next(new ApiError("Yetkisiz.", 403));

    const uid = normalizeUid(req.params.uid);
    if (!uid) return next(new ApiError("uid gerekli.", 400));

    const scheduledAt = req.body?.scheduledAt
      ? new Date(req.body.scheduledAt)
      : null;

    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return next(
        new ApiError("scheduledAt geçerli bir tarih olmalı.", 400)
      );
    }

    const post = await BlogPost.findOne({ uid });
    if (!post) return next(new ApiError("Blog yazısı bulunamadı.", 404));

    post.status = "scheduled";
    post.scheduledAt = scheduledAt;
    post.publishedAt = null;

    await post.save();
    return res.status(200).json({ item: pickPublicFields(post) });
  } catch (err) {
    return next(err);
  }
};

const adminGetBlogPostByUid = async (req, res, next) => {
  try {
    requireAuth(req);
    if (!canManagePosts(req)) return next(new ApiError("Yetkisiz.", 403));

    const uid = normalizeUid(req.params.uid);
    if (!uid) return next(new ApiError("uid gerekli.", 400));

    const post = await BlogPost.findOne({
      uid,
      isDeleted: { $ne: true },
    });

    if (!post) return next(new ApiError("Blog yazısı bulunamadı.", 404));

    return res.status(200).json({ item: pickPublicFields(post) });
  } catch (err) {
    return next(err);
  }
};

/** Export Tümü */
module.exports = {
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
};
