// backend/test-langchain.mjs
import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.7,
});


const prompt = new PromptTemplate({
  template: "Explain how {service} issues are handled by city services.",
  inputVariables: ["service"],
});

// ✅ RunnableSequence replaces LLMChain
const chain = RunnableSequence.from([prompt, model]);

const result = await chain.invoke({ service: "water supply" });
console.log(result);
