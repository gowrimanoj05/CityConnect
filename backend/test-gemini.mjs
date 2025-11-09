import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("[test] GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

try {
  const result = await model.generateContent("Hello from Gemini!");
  console.log("[test] Response from Gemini:");
  console.log(result.response.text());
} catch (error) {
  console.error("[test] Error:", error.message);
}
