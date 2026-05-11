const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * WhatsApp AI Assistant - Smart Analyzer + Chat + Scam Detector
 */
async function analyzeMessage(messageText, mediaObject = null, history = [], retryCount = 0) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  // 🧠 MASTER PROMPT (UPGRADED BRAIN)
  const prompt = `
You are an advanced WhatsApp AI assistant.

You can:
1. Detect scams / phishing / fake messages
2. Summarize long messages
3. Answer questions clearly
4. Analyze images/media
5. Give practical advice

IMPORTANT RULES:
- NEVER say "UNVERIFIABLE"
- If unsure, give "LIKELY TRUE" or "LIKELY FAKE"
- Always respond in a helpful, confident tone
- Keep answers short and WhatsApp-friendly
- If scam detected, clearly warn user

Return ONLY valid JSON:

{
  "type": "CHAT | SCAM | SUMMARY | ANALYSIS",
  "verdict": "REAL | FAKE | LIKELY TRUE | LIKELY FAKE | SAFE",
  "confidence": "0-100%",
  "reply": "main response to user in simple language",
  "reason": "short explanation (max 40 words)",
  "red_flags": ["list key risks if any"],
  "advice": "what user should do next",
  "summary": "if message is long, short summary otherwise empty"
}

User message:
${messageText || "Analyze this media content."}
`;

  const contents = [];

  // keep last 2 chats for context
  if (history && history.length > 0) {
    contents.push(...history.slice(-2));
  }

  const currentParts = [{ text: prompt }];

  // 📸 Media support (images/videos)
  if (mediaObject) {
    currentParts.push({
      inlineData: {
        data: mediaObject.data,
        mimeType: mediaObject.mimeType,
      },
    });
  }

  contents.push({
    role: "user",
    parts: currentParts,
  });

  try {
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1200,
      },
    });

    const response = await result.response;
    const rawText = response.text().trim();

    console.log("🤖 RAW GEMINI OUTPUT:", rawText);

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.warn("⚠️ JSON parse failed, using fallback...");

      // safer fallback extraction
      const get = (key) => {
        const match = rawText.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`));
        return match ? match[1] : "";
      };

      data = {
        type: "CHAT",
        verdict: "LIKELY TRUE",
        confidence: "70%",
        reply: rawText.slice(0, 300),
        reason: "Fallback parsing used",
        red_flags: [],
        advice: "Be cautious and verify if needed",
        summary: "",
      };
    }

    return {
      type: data.type || "CHAT",
      verdict: data.verdict || "SAFE",
      confidence: data.confidence || "0%",
      reply: data.reply || "I couldn't fully analyze this, but here’s what I found.",
      reason: data.reason || "",
      redFlags: data.red_flags || [],
      advice: data.advice || "",
      summary: data.summary || "",
    };

  } catch (error) {
    console.error("🤖 Gemini Error:", error.message);

    // retry logic (light)
    if (
      retryCount < 2 &&
      (error.message.includes("timeout") ||
        error.message.includes("fetch") ||
        error.message.includes("JSON"))
    ) {
      await new Promise((r) => setTimeout(r, 1500));
      return analyzeMessage(messageText, mediaObject, history, retryCount + 1);
    }

    return {
      type: "CHAT",
      verdict: "SAFE",
      confidence: "0%",
      reply: "Sorry, I’m having trouble analyzing this right now. Please try again.",
      reason: "API failure",
      redFlags: [],
      advice: "Try sending a shorter message",
      summary: "",
    };
  }
}

module.exports = { analyzeMessage };
