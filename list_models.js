import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available Models:");
    data.models.forEach(model => {
      console.log(`- ${model.name} (Methods: ${model.supportedGenerationMethods.join(", ")})`);
    });
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

list();
