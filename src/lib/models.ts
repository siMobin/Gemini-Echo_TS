/**
 * List of available Gemini models
 *
 * @description This module exports a list of available Gemini models for use with the Gemini AI service
 * The first model in the array is considered the default model.
 * @module models
 * @constant {string[]} GEMINI_MODELS
 *
 **/

export const GEMINI_MODELS = [
  // 1st one is the default model!
  "gemini-2.0-flash",
  "gemini-2.0-flash-preview-image-generation", // Add image generation model
  "gemini-2.5-flash-lite-preview-06-17", 
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export const IMAGE_GENERATION_MODEL = "gemini-2.0-flash-preview-image-generation";

// Helper function to detect image generation requests
export function isImageGenerationRequest(message: string): boolean {
  const imageKeywords = [
    'generate image', 'create image', 'draw', 'make a picture', 
    'create a picture', 'generate a photo', 'create artwork',
    'paint', 'sketch', 'illustrate', 'visualize', 'show me',
    'can you draw', 'make an image', 'create visual', 'generate an image'
  ];
  
  const messageLower = message.toLowerCase();
  console.log('Checking image generation for:', messageLower);
  const isImage = imageKeywords.some(keyword => messageLower.includes(keyword));
  console.log('Is image generation request:', isImage);
  return isImage;
}