// controllers/time.js (CommonJS)
const puppeteer = require("puppeteer");

const BASE_URL =
  "https://ramazan.dinimizislam.com/ramazan-bayram-namazi-saatleri.asp";

function pickIlParam(il) {
  const s = String(il ?? "").trim();
  if (!/^\d+$/.test(s)) return null;
  return s;
}

const getBayramNamaziSaati = async (req, res) => {
  let browser;
  try {
    const il = pickIlParam(req.query.il || req.body?.il);
    if (!il) {
      return res.status(400).json({
        message: "Geçerli bir il kodu (il) göndermelisin. Örn: ?il=16770",
      });
    }

    const url = `${BASE_URL}?il=${encodeURIComponent(il)}`;

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    page.setDefaultNavigationTimeout(30_000);
    page.setDefaultTimeout(15_000);

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const result = await page.evaluate(() => {
      const timeNode =
        document.querySelector('strong[style*="font-size:54px"]') ||
        document.querySelector('strong[style*="font-size: 54px"]');

      const timeText = timeNode?.textContent?.trim() || "";

      const dateNode =
        document.querySelector('strong[style*="font-size:18px"]') ||
        document.querySelector('strong[style*="font-size: 18px"]');

      const dateText = dateNode?.textContent?.trim() || "";

      let cityText = "";
      const p = timeNode?.closest("p");
      if (p) {
        const raw = p.textContent || "";
        const normalized = raw
          .replace(/\s+/g, " ")
          .replace("Ramazan Bayram Namazı Vakti", "|")
          .trim();

        const maybeCity = normalized.split("|")[0]?.trim();
        if (maybeCity) cityText = maybeCity;
      }

      return { dateText, cityText, timeText };
    });

    const timeOk = /^\d{2}:\d{2}$/.test(result.timeText);
    if (!timeOk) {
      return res.status(404).json({
        message:
          "Namaz saati bulunamadı. Site yapısı değişmiş olabilir veya il parametresi hatalı olabilir.",
        url,
        raw: result,
      });
    }

    return res.status(200).json({
      message: "Bayram namazı saati başarıyla alındı.",
      url,
      il,
      city: result.cityText || null,
      date: result.dateText || null,
      time: result.timeText,
    });
  } catch (error) {
    console.error("getBayramNamaziSaati error:", error);
    return res.status(500).json({
      message: "Bayram namazı saati çekilirken bir hata oluştu.",
      error: error.message,
    });
  } finally {
    try {
      if (browser) await browser.close();
    } catch {}
  }
};

const getTodaySunset = async (req, res) => {
  let browser;

  try {
    const city = (req.query.city || "istanbul").toLowerCase();
    const url = `https://tr.meteocast.net/sunrise-sunset/tr/${city}/`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const todayTR = new Date().toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const result = await page.evaluate((todayTR) => {
      const blocks = document.querySelectorAll(".section.detailed.extable .ay");

      for (const block of blocks) {
        const h5 = block.querySelector("h5");
        if (!h5) continue;

        if (h5.innerText.includes(todayTR.split(" ")[0])) {
          const text = block.innerText;
          const match = text.match(/Gün batımı:\s*(\d{2}:\d{2})/);
          if (match) {
            return { date: h5.innerText, sunset: match[1] };
          }
        }
      }

      return null;
    }, todayTR);

    if (!result) {
      return res.status(404).json({
        message: "Bugünün gün batımı bilgisi bulunamadı.",
      });
    }

    return res.status(200).json({ city, ...result });
  } catch (error) {
    console.error("getTodaySunset error:", error);
    return res.status(500).json({
      message: "Gün batımı hesaplanırken hata oluştu.",
      error: error.message,
    });
  } finally {
    if (browser) await browser.close();
  }
};

const getTodaySunrise = async (req, res) => {
  let browser;

  try {
    const city = (req.query.city || "istanbul").toLowerCase();
    const url = `https://tr.meteocast.net/sunrise-sunset/tr/${city}/`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const todayTR = new Date().toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const result = await page.evaluate((todayTR) => {
      const blocks = document.querySelectorAll(".section.detailed.extable .ay");

      for (const block of blocks) {
        const h5 = block.querySelector("h5");
        if (!h5) continue;

        const dayMonthYear = todayTR
          .replaceAll(".", "")
          .split(" ")
          .filter(Boolean)
          .slice(0, 3)
          .join(" ");

        if (h5.innerText.includes(dayMonthYear)) {
          const text = block.innerText;
          const match = text.match(/Gündoğumu\s*(\d{2}:\d{2})/);
          if (match) {
            return { date: h5.innerText, sunrise: match[1] };
          }
        }
      }

      return null;
    }, todayTR);

    if (!result) {
      return res.status(404).json({
        message: "Bugünün gün doğumu bilgisi bulunamadı.",
      });
    }

    return res.status(200).json({ city, ...result });
  } catch (error) {
    console.error("getTodaySunrise error:", error);
    return res.status(500).json({
      message: "Gün doğumu hesaplanırken hata oluştu.",
      error: error.message,
    });
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = {
  getBayramNamaziSaati,
  getTodaySunset,
  getTodaySunrise,
};
