const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

function getExecutablePath() {
  if (process.env.NODE_ENV === "production" && process.env.RENDER) {
    // Render.com için yaygın chromium yolu
    return "/usr/bin/chromium-browser";
  }
  return undefined; // Local dev için normal puppeteer chromium
}

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url || (!url.includes("tiktok.com/") && !url.includes("vt.tiktok.com/"))) {
    return res.status(400).json({ error: "Invalid TikTok URL" });
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
      executablePath: getExecutablePath(),
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });

    await page.waitForSelector("video", { timeout: 15000 });
    const videoUrl = await page.evaluate(() => {
      const video = document.querySelector("video");
      return video ? video.src : null;
    });

    if (!videoUrl) {
      return res.status(404).json({ error: "Could not extract video URL" });
    }

    res.json({ video: videoUrl });
  } catch (err) {
    res.status(500).json({ error: "Puppeteer/parse error: " + err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/", (req, res) => res.send("TikTok Puppeteer Backend is running 🚀"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});