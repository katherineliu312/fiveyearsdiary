import { GoogleGenAI } from "@google/genai";
import { DiaryEntry } from '../types';

export const generateTimeCapsuleInsight = async (
  dateStr: string,
  entries: DiaryEntry[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please provide a valid API key.");
  }

  if (entries.length < 2) {
    return "Not enough entries to generate a comparison pattern. Write more to see your growth!";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Sort entries chronologically for the model
  const sortedEntries = [...entries].sort((a, b) => a.year - b.year);

  const entriesText = sortedEntries.map(e => 
    `[${e.year}]: Mood: ${e.mood || 'None'} - Content: "${e.content}"`
  ).join('\n');

  const prompt = `
    You are a gentle, insightful personal diarist assistant.
    The user is looking at their "5-Year Diary" for the date: ${dateStr}.
    
    Here are their entries from different years on this exact day:
    ${entriesText}

    Please provide a short, warm, and healing reflection (approx 100-150 words).
    Focus on:
    1. Common themes or recurring emotions on this day.
    2. Signs of growth, maturity, or change in perspective.
    3. A gentle encouragement for the future.

    Do not use markdown headers like ##. Just use paragraphs. 
    Tone: Soothing, observant, "Japanese Zakka" style (simple, mindful).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Flash doesn't need high thinking for this
      }
    });

    return response.text || "I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The stars are a bit cloudy right now. Please try again later.";
  }
};