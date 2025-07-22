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
  // 2.5 models
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite-preview-06-17",
  // 2.0 models
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-preview-image-generation", // Image generation model
  // 1.5 models
  // depreciated
  // "gemini-1.5-flash",
  // "gemini-1.5-pro",
];

// Image generation model
export const IMAGE_GENERATION_MODEL = "gemini-2.0-flash-preview-image-generation";
