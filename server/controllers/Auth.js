const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../error/ApiError.js");

/* ===========================
   Helpers
=========================== */

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new ApiError("JWT_SECRET tanımlı değil (.env).", 500);
  }

  // ✅ middleware decoded.id / decoded.uid bekliyor → payload'ı buna göre atıyoruz
  return jwt.sign(
    {
      id: String(user._id),
      uid: user.uid || null,
      roles: user.roles || ["user"], // şemanda roles yoksa bile default
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd, // prod'da https
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 gün
  });
}

/* ===========================
   REGISTER
   POST /register
=========================== */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, locale } = req.body || {};

    const e = normalizeEmail(email);
    const p = String(password || "");

    if (!e || !p) {
      return res.status(400).json({ ok: false, message: "Email ve şifre zorunlu" });
    }

    if (p.length < 6) {
      return res.status(400).json({ ok: false, message: "Şifre en az 6 karakter olmalı" });
    }

    const exists = await User.findOne({ email: e });
    if (exists) {
      return res.status(409).json({ ok: false, message: "Bu e-posta zaten kayıtlı" });
    }

    const passwordHash = await bcrypt.hash(p, 10);

    const user = await User.create({
      fullName: typeof fullName === "string" ? fullName.trim() : undefined,
      email: e,
      passwordHash,
      locale: locale === "en" ? "en" : "tr",
      // uid schema default üretmeli (sen ekledin)
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      ok: true,
      token, // istersen frontend için dursun
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    // duplicate index yakala (email / uid vs)
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, message: "Bu kullanıcı zaten kayıtlı." });
    }

    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   LOGIN
   POST /login
=========================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const e = normalizeEmail(email);
    const p = String(password || "");

    if (!e || !p) {
      return res.status(400).json({ ok: false, message: "Email ve şifre zorunlu" });
    }

    const user = await User.findOne({ email: e });
    if (!user) {
      return res.status(401).json({ ok: false, message: "Geçersiz email veya şifre" });
    }

    const isMatch = await bcrypt.compare(p, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "Geçersiz email veya şifre" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    setAuthCookie(res, token);

    return res.json({ ok: true, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   ME
   GET /me
=========================== */
exports.me = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    const { passwordHash, ...safeUser } = user;

    return res.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   LOGOUT
   GET /logout
=========================== */
exports.logout = async (req, res) => {
  try {
    // ✅ cookie’yi temizle
    res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    return res.json({ ok: true, message: "Çıkış yapıldı" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};
