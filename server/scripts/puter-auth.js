const fs = require("fs");
const path = require("path");
const { init, getAuthToken } = require("@heyputer/puter.js/src/init.cjs");

const TOKEN_PATH = path.join(process.cwd(), ".puter.token");

(async () => {
  const authToken = await getAuthToken();
  if (!authToken || typeof authToken !== "string") {
    throw new Error("Auth token alınamadı.");
  }

  fs.writeFileSync(TOKEN_PATH, authToken, "utf8");
  console.log("✅ Token kaydedildi:", TOKEN_PATH);

  const puter = init(authToken);
  const r = await puter.ai.chat("Ping: reply with OK");
  console.log("AI:", r);
})().catch((e) => {
  console.error("❌ puter-auth hata:", e);
  process.exit(1);
});
