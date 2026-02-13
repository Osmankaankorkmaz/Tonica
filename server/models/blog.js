const mongoose = require("mongoose");

// nanoid CJS uyumluluğu
let nanoid;
try {
  ({ nanoid } = require("nanoid"));
} catch {
  nanoid = () => require("crypto").randomUUID(); // fallback
}

/** TR slug */
function slugifyTR(input = "") {
  return String(input)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function calcReadingTime(text = "") {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, trim: true, default: "" },
    alt: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const blogPostSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      default: () => nanoid(),
      unique: true,
      required: true,
      index: true,
      immutable: true,
    },

    title: { type: String, required: true, trim: true },

    slug: { type: String, lowercase: true, trim: true, index: true },

    summary: { type: String, maxlength: 350, default: "", trim: true },
    content: { type: String, required: true },

    seo: {
      metaTitle: { type: String, default: "", trim: true },
      metaDescription: { type: String, default: "", trim: true },
      keywords: [{ type: String, trim: true }],
    },

    coverImage: { type: imageSchema, default: null },

    category: { type: String, default: "blog", trim: true, index: true },

    tags: [{ type: String, trim: true, lowercase: true, index: true }],

    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: { type: Date, default: null, index: true },
    scheduledAt: { type: Date, default: null, index: true },

    featured: { type: Boolean, default: false, index: true },

    author: {
      uid: { type: String, trim: true, default: "" },
      name: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, lowercase: true, default: "" },
    },

    readingTime: { type: Number, default: 1 },

    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    collection: "blog_posts",
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

/** Unique slug + soft delete uyumlu */
blogPostSchema.index({ slug: 1, isDeleted: 1 }, { unique: true });

/** Text arama index */
blogPostSchema.index({ title: "text", summary: "text", content: "text" });

/** Soft delete — find */
blogPostSchema.pre(/^find/, function (next) {
  const q = this.getQuery();
  if (q?.isDeleted === undefined) this.where({ isDeleted: false });
  next();
});

/** Soft delete — update */
blogPostSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    const q = this.getQuery();
    if (q?.isDeleted === undefined) this.where({ isDeleted: false });
    next();
  }
);

/** Normalize & derive */
blogPostSchema.pre("validate", function (next) {
  if (this.title && !this.slug) this.slug = slugifyTR(this.title);

  if (!this.slug) this.invalidate("slug", "slug gerekli.");

  if (Array.isArray(this.tags)) {
    this.tags = this.tags
      .map((t) => String(t || "").trim().toLowerCase())
      .filter(Boolean);
  }

  this.readingTime = calcReadingTime(this.content || "");

  next();
});

/** Status => published / scheduled / draft mantığı */
blogPostSchema.pre("save", function (next) {
  if (this.status === "published") {
    if (!this.publishedAt) this.publishedAt = new Date();
    this.scheduledAt = null;
  } else if (this.status === "scheduled") {
    if (!this.scheduledAt) {
      this.scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    }
    this.publishedAt = null;
  } else {
    this.publishedAt = null;
    this.scheduledAt = null;
  }

  next();
});

const BlogPost =
  mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;
