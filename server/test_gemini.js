import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'hello world'");
    console.log(`✅ Success for ${modelName}:`, result.response.text().trim());
  } catch (err) {
    console.error(`❌ Error for ${modelName}:`, err.message);
  }
}

async function run() {
  await testModel("gemini-1.5-flash");
  await testModel("gemini-2.5-flash");
  await testModel("gemini-2.0-flash");
}

run();
