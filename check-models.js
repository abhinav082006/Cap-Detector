require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTry = [
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ];

  console.log("🔍 Testing multiple model names...");

  for (const modelName of modelsToTry) {
    try {
      console.log(`\n📡 Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");
      console.log(`✅ SUCCESS with ${modelName}!`);
      console.log(`Response: ${result.response.text().substring(0, 20)}...`);
      return; // Stop if one works
    } catch (error) {
      console.log(`❌ Failed: ${modelName}`);
      console.log(`Reason: ${error.message.substring(0, 100)}`);
    }
  }

  console.log("\n❌ All standard models failed. Please check your Google AI Studio project settings.");
}

checkModels();
