const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const { Schema } = mongoose;

/* ===========================
   Embedded Schemas
=========================== */

// Tag
const TagSchema = new Schema({
  _id: { type: String, default: () => nanoid() },
  name: { type: String, required: true, trim: true, maxlength: 24 },
  color: { type: String, trim: true, maxlength: 16 },
});

// Category
const CategorySchema = new Schema({
  _id: { type: String, default: () => nanoid() },
  name: { type: String, required: true, trim: true, maxlength: 32 },
  icon: { type: String, trim: true, maxlength: 32 },
});

// Task
const TaskSchema = new Schema({
  _id: { type: String, default: () => nanoid() },

  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, trim: true, maxlength: 2000 },

  status: {
    type: String,
    enum: ["todo", "doing", "done"],
    default: "todo",
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },

  tagIds: [{ type: String }],
  categoryId: { type: String },

  order: { type: Number, default: 0 },

  dueAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },

  aiRecap: { type: String, trim: true, maxlength: 1000 },

  archived: { type: Boolean, default: false },
});

// Focus Plan
const FocusPlanSchema = new Schema(
  {
    dateKey: { type: String, required: true }, // "2026-02-12"

    items: [
      {
        taskId: { type: String },
        titleSnapshot: { type: String, trim: true, maxlength: 140 },
        order: { type: Number, default: 0 },
      },
    ],

    aiSummary: { type: String, trim: true, maxlength: 1200 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// AI History
const AiHistorySchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "task_suggestion",
        "title_improve",
        "priority_tag",
        "next_step",
        "recap",
        "focus_plan",
      ],
      required: true,
    },
    taskId: { type: String },
    input: { type: Schema.Types.Mixed },
    output: { type: Schema.Types.Mixed },
    applied: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ===========================
   Main User Schema
=========================== */

const UserSchema = new Schema(
  {
    // ✅ DB’de uid_1 unique index var, burada alanı tanımlıyoruz
    uid: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },

    fullName: { type: String, trim: true, maxlength: 80 },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    passwordHash: { type: String, required: true },

    locale: { type: String, enum: ["tr", "en"], default: "tr" },

    settings: {
      aiAssistEnabled: { type: Boolean, default: true },

      ai: {
        titleImprove: { type: Boolean, default: true },
        priorityTagSuggest: { type: Boolean, default: true },
        nextStepSuggest: { type: Boolean, default: true },
        focusPlan: { type: Boolean, default: true },
        tone: {
          type: String,
          enum: ["concise", "balanced", "detailed"],
          default: "balanced",
        },
      },
    },

    tags: { type: [TagSchema], default: [] },
    categories: { type: [CategorySchema], default: [] },
    tasks: { type: [TaskSchema], default: [] },
    focusPlans: { type: [FocusPlanSchema], default: [] },
    aiHistory: { type: [AiHistorySchema], default: [] },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// (Opsiyonel ama iyi) Index’i kodda da garanti et
UserSchema.index({ uid: 1 }, { unique: true });

/* ===========================
   AI HISTORY LIMIT (MAX 25)
=========================== */

UserSchema.pre("save", function (next) {
  // ✅ ekstra güvenlik: uid yoksa set et
  if (!this.uid) this.uid = nanoid(12);

  if (this.aiHistory.length > 25) {
    this.aiHistory = this.aiHistory.slice(-25);
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
