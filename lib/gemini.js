const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMessage(messageText, mediaObject = null, history = [], retryCount = 0) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = `You are an elite Fact-Checking AI. Analyze the content and return a JSON object.
  
JSON Schema:
{
  "verdict": "REAL" | "FAKE" | "UNVERIFIABLE",
  "confidence": "percentage",
  "reason": "Clear explanation of why it is true or false",
  "red_flags": ["list of specific suspicious elements"],
  "safety_tip": "Advice for the user",
  "source_link": "link to a credible source"
}

Analyze this: ${messageText || "Analyze this media."}

CRITICAL: Provide "reason", "red_flags", and "safety_tip" in the SAME LANGUAGE as the input.
Keep the reason SHORT (max 40 words).`;

  const contents = [];
  if (history && history.length > 0) contents.push(...history.slice(-2));

  const currentParts = [{ text: prompt }];
  if (mediaObject) {
    currentParts.push({
      inlineData: { data: mediaObject.data, mimeType: mediaObject.mimeType }
    });
  }
  contents.push({ role: "user", parts: currentParts });

  try {
    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const rawText = response.text().trim();
    console.log("🤖 RAW JSON:", rawText);

    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.warn("⚠️ JSON Parse failed, using robust fallback...");
      
      // Robust Regex Fallback
      const getField = (field) => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)`);
        const match = rawText.match(regex);
        return match ? match[1] : null;
      };

      // Extract Array for Red Flags
      const getArray = (field) => {
        const regex = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)`);
        const match = rawText.match(regex);
        if (match && match[1]) {
          return match[1].split(',').map(s => s.replace(/"/g, '').trim()).filter(s => s.length > 3);
        }
        return [];
      };

      data = {
        verdict: getField("verdict") || "UNVERIFIABLE",
        confidence: getField("confidence") || "90%",
        reason: getField("reason") || "Analysis cut off during processing.",
        red_flags: getArray("red_flags"),
        safety_tip: getField("safety_tip") || "Be careful with this type of message.",
        source_link: getField("source_link") || ""
      };
    }

    return {
      verdict: data.verdict || "UNVERIFIABLE",
      confidence: data.confidence || "0%",
      reason: data.reason || "Unable to analyze.",
      redFlags: data.red_flags || [],
      safetyTip: data.safety_tip || "Be cautious with forwarded messages.",
      sourceLink: data.source_link || ""
    };
  } catch (error) {
    console.error(`🤖 Gemini API Error (Attempt ${retryCount + 1}):`, error.message);
    
    if (retryCount < 2 && (error.message.includes("fetch failed") || error.message.includes("timeout") || error.message.includes("JSON"))) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return analyzeMessage(messageText, mediaObject, history, retryCount + 1);
    }

    return {
      verdict: "UNVERIFIABLE",
      confidence: "0%",
      reason: "The AI encountered a connection issue. This usually happens with very long or complex messages.",
      redFlags: [],
      safetyTip: "Try sending a shorter snippet of the message.",
      sourceLink: ""
    };
  }
}

module.exports = { analyzeMessage };
