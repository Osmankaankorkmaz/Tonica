// index.js (veya app.js) — TONICA ONLY (FULL) ✅

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const passport = require("passport");
const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const helmet = require("helmet");
const logger = require("morgan");
const cloudinary = require("cloudinary");

const GenericErrorHandler = require("./middleware/GenericErrorHandler.js");
const Users = require("./models/user.js");
const db = require("./config/db.js");

const authRoutes = require("./routes/auth.js");
const aiRoutes = require("./routes/ai.js");
const taskRoutes = require("./routes/tasks.js");
const focusRoutes = require("./routes/focus.js");

dotenv.config();

/** ---------- Cloudinary ---------- */
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

/** ---------- DB ---------- */
(async () => {
  try {
    await (db?.() || db());
    console.log("✅ DB bağlantısı kuruldu");
  } catch (e) {
    console.error("❌ DB bağlantı hatası:", e);
  }
})();

const app = express();

/** ---------- Basic middleware ---------- */
app.set("trust proxy", 1);
app.use(logger(process.env.LOGGER || "dev"));

/** ---------- Helmet ---------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/** ---------- CORS ---------- */
const ALLOWED_ORIGINS = new Set([
  // local
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",

  // prod FE domainleri
  "https://meowsoftware.com.tr",
  "https://www.meowsoftware.com.tr",
  "https://tonica.vercel.app",
  "https://tonica.com.tr",
]);

// Vercel preview domainleri (Tonica)
const ALLOWED_ORIGIN_REGEX = [/^https:\/\/.*-osmankaankorkmazs-projects\.vercel\.app$/];

function isAllowedOrigin(origin) {
  if (!origin) return true; // Postman / server-to-server
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return ALLOWED_ORIGIN_REGEX.some((re) => re.test(origin));
}

const corsOptions = {
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 204,
};

// 1) cors middleware
app.use(cors(corsOptions));

// 2) Preflight'ı kesin yakala (Express'te "*" yerine /.*/ daha sağlam)
app.options(/.*/, cors(corsOptions));

// 3) SIGORTA: Bazı proxy/cpanel ortamlarında cors middleware çalışsa bile
// OPTIONS yanıtında header basılmayabiliyor. Bu blok kesin çözer.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

/** ---------- Parsers ---------- */
app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

/** ---------- Passport ---------- */
app.use(passport.initialize());

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET tanımlı değil. Koruma isteyen route’lar çalışmayabilir.");
}

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOpts, async (jwtPayload, done) => {
    try {
      const id = jwtPayload?.id || jwtPayload?._id;
      if (!id) return done(null, false);

      const user = await Users.findById(id);
      if (!user) return done(null, false);

      return done(null, user.toJSON());
    } catch (err) {
      return done(err, false);
    }
  })
);

/** ---------- Debug (isteğe bağlı) ----------
 * CORS hala sorun çıkartırsa aç:
 * app.use((req, _res, next) => {
 *   console.log("REQ:", req.method, req.url, "ORIGIN:", req.headers.origin);
 *   next();
 * });
 */

/** ---------- Routes ---------- */
app.use("/", authRoutes);
app.use("/", aiRoutes);
app.use("/", taskRoutes);
app.use("/", focusRoutes);

/** ---------- CORS error handler (nice JSON) ---------- */
app.use((err, req, res, next) => {
  if (err?.message?.startsWith("Not allowed by CORS")) {
    return res.status(403).json({ ok: false, message: err.message });
  }
  return next(err);
});

/** ---------- Generic Error Handler ---------- */
app.use(GenericErrorHandler);

/** ---------- Listen ---------- */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`✅ Express uygulaması ${PORT} portunda çalışıyor`);
});
