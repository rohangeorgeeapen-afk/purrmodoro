import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL } from '../constants';
import { TimerMode, QuoteResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchCatWisdom = async (mode: TimerMode): Promise<QuoteResponse> => {
  try {
    const prompt = mode === TimerMode.WORK 
      ? "Generate a very short (max 15 words), cute, motivating sentence from a cat to a human who needs to focus. The cat is encouraging. Return JSON."
      : "Generate a very short (max 15 words), cute, funny sentence from a cat to a human who is taking a break. The cat is sleepy or playful. Return JSON.";

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            mood: { type: Type.STRING, enum: ['happy', 'sleepy', 'focused', 'playful'] }
          },
          required: ['text', 'mood']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { text: "Meow! (Error fetching wisdom)", mood: 'playful' };
    
    return JSON.parse(jsonText) as QuoteResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Purr... connection lost. Just keep going!", mood: 'sleepy' };
  }
};