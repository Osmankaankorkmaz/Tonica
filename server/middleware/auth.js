const jwt = require("jsonwebtoken");
const ApiError = require("../error/ApiError.js");

const authenticationMid = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) return next(new ApiError("Erişim için lütfen giriş yapınız!", 401));

    if (!process.env.JWT_SECRET) {
      return next(new ApiError("JWT_SECRET tanımlı değil (.env).", 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,     
      uid: decoded.uid,   
      roles: decoded.roles || ["user"],
    };

    return next();
  } catch (error) {
    return next(new ApiError("Erişim tokenınız geçersizdir!", 401));
  }
};

const roleChecked = (...roles) => {
  return (req, res, next) => {
    try {
      const userRoles = req.user?.roles || [];
      const ok = userRoles.some((r) => roles.includes(r));

      if (!ok) {
        return next(new ApiError("Bu işlemi gerçekleştirmek için yetkiniz yok.", 403));
      }

      return next();
    } catch (error) {
      return next(new ApiError("Sunucu hatası.", 500));
    }
  };
};

module.exports = { authenticationMid, roleChecked };
