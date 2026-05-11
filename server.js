require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { MessagingResponse } = require("twilio").twiml;
const { analyzeMessage } = require("./lib/gemini");
const { formatVerdict, formatError, formatWelcome } = require("./lib/formatter");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global Logger
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const sessions = new Map();

function getHistory(userId) {
  if (!sessions.has(userId)) sessions.set(userId, []);
  return sessions.get(userId);
}

function updateHistory(userId, role, text) {
  const history = getHistory(userId);
  history.push({ role, parts: [{ text }] });
  if (history.length > 10) history.shift();
}

app.post("/webhook", async (req, res) => {
  const twiml = new MessagingResponse();

  try {
    const incomingMessage = (req.body.Body || "").trim();
    const numMedia = parseInt(req.body.NumMedia || "0");
    const from = req.body.From || "unknown";
    const history = getHistory(from);

    console.log(`\n📩 Incoming from: ${from}`);
    console.log(`📝 Text Content: "${incomingMessage}"`);
    console.log(`📎 Media Count: ${numMedia}`);

    let mediaObject = null;
    if (numMedia > 0) {
      const mediaUrl = req.body.MediaUrl0;
      const contentType = req.body.MediaContentType0;
      console.log(`📸 Processing Media: ${contentType}`);
      
      console.log(`📸 Downloading media from Twilio...`);
      const twilioAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      
      const response = await axios.get(mediaUrl, { 
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Basic ${twilioAuth}`
        }
      });
      mediaObject = {
        data: Buffer.from(response.data, 'binary').toString('base64'),
        mimeType: contentType
      };
    }

    if (!mediaObject && (!incomingMessage || isGreeting(incomingMessage))) {
      console.log("👋 Sending Greeting/Welcome");
      twiml.message(formatWelcome());
      return res.type("text/xml").send(twiml.toString());
    }

    console.log("🤖 Calling Gemini AI...");
    const result = await analyzeMessage(incomingMessage, mediaObject, history);

    updateHistory(from, "user", incomingMessage || "(Media)");
    updateHistory(from, "model", JSON.stringify(result));

    console.log(`✅ Success: ${result.verdict}`);
    twiml.message(formatVerdict(result));

  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error.message);
    if (error.response) console.error("Data:", error.response.data);
    twiml.message(formatError());
  }

  return res.type("text/xml").send(twiml.toString());
});

const GREETING_PATTERNS = [/^hi+$/i, /^hello+$/i, /^hey+$/i, /^help$/i, /^start$/i];
function isGreeting(text) {
  return GREETING_PATTERNS.some((p) => p.test(text.trim()));
}

app.get("/health", (req, res) => res.json({ status: "ok" }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));
