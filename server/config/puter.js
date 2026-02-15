// server/config/puter.js
const fs = require("fs");
const path = require("path");
const { init } = require("@heyputer/puter.js/src/init.cjs");

let _puter = null;

function readToken() {
  const envToken = process.env.PUTER_AUTH_TOKEN;
  if (envToken && String(envToken).trim()) return String(envToken).trim();

  const p = path.join(process.cwd(), ".puter.token");
  if (fs.existsSync(p)) return fs.readFileSync(p, "utf8").trim();

  return "";
}

function getPuter() {
  if (_puter) return _puter;

  const token = readToken();
  if (!token) {
    throw new Error("Puter token yok. `node scripts/puter-auth.js` çalıştır veya PUTER_AUTH_TOKEN env ver.");
  }

  _puter = init(token);
  return _puter;
}

module.exports = { getPuter };
