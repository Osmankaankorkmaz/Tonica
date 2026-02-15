const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const { Schema } = mongoose;

/* ===========================
   Task Schema (Embedded)
=========================== */

const TaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },

    // ✅ NEW: Açıklama
    description: { type: String, trim: true, maxlength: 2000, default: "" },

    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"], // "urgent" yok (UI'da urgent seçilirse high'a map'le)
      default: "medium",
      index: true,
    },

    category: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "General",
      index: true,
    },

    dueAt: { type: Date, default: null, index: true },

    // ✅ NEW: Tahmini Süre (dk)
    durationMinutes: { type: Number, default: 0, min: 0, max: 24 * 60 },

    // ✅ NEW: Etiketler ( "design, frontend, urgent" => ["design","frontend","urgent"] )
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(arr) {
          return Array.isArray(arr) && arr.every((x) => typeof x === "string" && x.length <= 24);
        },
        message: "Geçersiz tags",
      },
      index: true,
    },
  },
  { _id: true, timestamps: true }
);


/* ===========================
   Focus Plan Schema (Minimal)
=========================== */

const FocusPlanSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    goal: { type: String, trim: true, maxlength: 300 },
    durationMinutes: { type: Number, default: 25, min: 1, max: 12 * 60 },
  },
  { _id: true, timestamps: true }
);

/* ===========================
   Focus Session Schema (NEW)
   (FocusPage uyumlu)
=========================== */

const FocusSessionSchema = new Schema(
  {
    // FocusPage: selectedTaskId opsiyonel
    taskId: { type: Schema.Types.ObjectId, default: null },

    // FocusPage: duration (seconds)
    durationSeconds: { type: Number, required: true, min: 60, max: 24 * 60 * 60 },

    // Oturum takip
    startedAt: { type: Date, default: Date.now, index: true },
    endedAt: { type: Date, default: null },

    // prev<=1 olunca complete say
    completed: { type: Boolean, default: false, index: true },

    // ileride pause/resume için (şimdilik optional)
    pausedSeconds: { type: Number, default: 0, min: 0 },
  },
  { _id: true, timestamps: true }
);

/* ===========================
   Main User Schema
=========================== */

const UserSchema = new Schema(
  {
    uid: { type: String, default: () => nanoid(12), unique: true },

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

    tasks: { type: [TaskSchema], default: [] },

    focusPlans: { type: [FocusPlanSchema], default: [] },

    // ✅ FocusPage için kalıcı istatistik kaynağı
    focusSessions: { type: [FocusSessionSchema], default: [] },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

/* ===========================
   Indexes
=========================== */

UserSchema.index({ "tasks.status": 1 });
UserSchema.index({ "tasks.dueAt": 1 });
UserSchema.index({ "tasks.category": 1 });

// Focus stats için
UserSchema.index({ "focusSessions.startedAt": 1 });
UserSchema.index({ "focusSessions.completed": 1 });

/* ===========================
   Hooks
=========================== */

UserSchema.pre("save", function (next) {
  if (!this.uid) this.uid = nanoid(12);
  next();
});

module.exports = mongoose.model("User", UserSchema);
