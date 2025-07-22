import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { GEMINI_MODELS } from "./models";

let genAI: GoogleGenAI | null = null;

export function initializeGemini(apiKey: string) {
  genAI = new GoogleGenAI({
    apiKey: apiKey,
  });
}

export function getGeminiModel(selectedModel?: string) {
  if (!genAI) {
    throw new Error("Gemini AI not initialized. Please set your API key first.");
  }

  const modelToUse = selectedModel || GEMINI_MODELS[0];

  // Check if this is an image generation model
  const isImageGeneration = modelToUse === "gemini-2.0-flash-preview-image-generation";

  const baseConfig = {
    temperature: 0.1,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
    responseMimeType: "text/plain",
  };

  // Configuration for image generation models
  if (isImageGeneration) {
    return {
      genAI,
      model: modelToUse,
      config: {
        ...baseConfig,
        responseModalities: ["IMAGE", "TEXT"],
      },
    };
  }

  // Configuration for regular text models
  return {
    genAI,
    model: modelToUse,
    config: {
      ...baseConfig,
      // mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,
      tools: [{ urlContext: {} }, { googleSearch: {} }],
    },
  };
}

export function isGeminiInitialized() {
  return genAI !== null;
}
