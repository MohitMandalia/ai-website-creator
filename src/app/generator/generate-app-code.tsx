// Gemini Code Generator MVP Starter

// 1. Install deps:
// npm install @google/generative-ai jszip file-saver next react tailwindcss

// 2. Create `lib/gemini.ts` to handle Gemini API call

import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const plan = "You are a full-stack developer. You will generate code for a Next.js app with Tailwind CSS based on user prompts. You can create a plan first, break down the prompt into smaller tasks, and then generate the code for each task. You will respond with a JSON object containing the stack and an array of files with their paths and contents. Your also have a great eye for visual design and are able to create beautiful and innovative designs";
export async function generateAppCode(userPrompt: string): Promise<any> {
    const fullPrompt = 
    `
    ${plan}

    "userPrompt:${userPrompt}"

    Respond with a JSON like:
    {
      "stack": "...",
      "files": [
        { "path": "pages/index.tsx", "content": "..." },
        { "path": "lib/stripe.ts", "content": "..." }
      ]
    }

    Output clean json which can be parsed and make sure its a valid json.
    Include:
    Include all necessary files for a Next.js app with Tailwind CSS.
    Include a README with setup instructions.
    `
  const model = genAI.models.generateContent({ model: "gemini-2.5-flash", contents: fullPrompt });

  

  const text = (await model).text;
  const cleaned = text!.trim()
  .replace(/^```json/, '')
  .replace(/^```/, '')
  .replace(/```$/, '')
  .trim()
  try {
    console.log("Cleaned JSON:", cleaned);
    const obj = JSON.parse(cleaned)
    console.log("Typed JSON:", typeof obj);
    return obj;
  } catch (err) {
    console.error("Invalid JSON:", cleaned);
    return null;
  }
}
