const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMessage(messageText, mediaObject = null, history = [], retryCount = 0) {
  // Using gemini-flash-latest to avoid quota issues with 2.0
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
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
  
  // Clean up history to ensure it's in the correct format for Gemini
  if (history && history.length > 0) {
    history.forEach(item => {
      if (item.role && item.parts) {
        contents.push(item);
      }
    });
  }

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
    console.log("🤖 Gemini Response received.");

    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.warn("⚠️ JSON Parse failed, using robust fallback...");
      
      // Robust Regex Fallback if JSON is messy
      const getField = (field) => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)`);
        const match = rawText.match(regex);
        return match ? match[1] : null;
      };

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
        reason: getField("reason") || "Analysis complete but formatting issue occurred.",
        red_flags: getArray("red_flags"),
        safety_tip: getField("safety_tip") || "Be careful with this type of message.",
        source_link: getField("source_link") || ""
      };
    }

    return {
      verdict: data.verdict || "UNVERIFIABLE",
      confidence: data.confidence || "0%",
      reason: data.reason || "Unable to generate reason.",
      redFlags: data.red_flags || [],
      safetyTip: data.safety_tip || "Be cautious with forwarded messages.",
      sourceLink: data.source_link || ""
    };

  } catch (error) {
    // Log the FULL error for debugging
    console.error(`❌ Gemini Error (Attempt ${retryCount + 1}):`, error.message);
    if (error.stack) console.error(error.stack);

    // Specific error handling
    if (error.message.includes("API key not valid")) {
      return {
        verdict: "ERROR",
        confidence: "0%",
        reason: "Your Gemini API Key is invalid. Please check your .env file.",
        redFlags: [],
        safetyTip: "Update your GEMINI_API_KEY in the .env file.",
        sourceLink: ""
      };
    }

    // Retry logic for transient network issues
    if (retryCount < 2 && (error.message.includes("fetch failed") || error.message.includes("timeout"))) {
      console.log("🔄 Retrying in 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return analyzeMessage(messageText, mediaObject, history, retryCount + 1);
    }

    return {
      verdict: "UNVERIFIABLE",
      confidence: "0%",
      reason: `Connection Error: ${error.message.split(' ').slice(0, 5).join(' ')}...`,
      redFlags: [],
      safetyTip: "Wait a moment and try again. This usually happens when the API is busy.",
      sourceLink: ""
    };
  }
}

module.exports = { analyzeMessage };
