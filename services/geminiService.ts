import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image using Gemini 3 Pro Preview to understand the subject.
 */
export const analyzeImage = async (base64Image: string): Promise<string> => {
  try {
    // Clean base64 string if it contains metadata
    const data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: data
            }
          },
          {
            text: "Analyze this image. Describe the person's physical appearance, expression, and any distinct features briefly in 2-3 sentences. This is for a photo transformation app."
          }
        ]
      }
    });

    return response.text || "Analysis failed to return text.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image using Gemini 3 Pro.");
  }
};

/**
 * Edits/Transforms an image using Gemini 2.5 Flash Image based on a prompt.
 */
export const transformImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    // Clean base64 string
    const data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // Using gemini-2.5-flash-image for image editing as requested
    // Note: For image editing, we pass the image + text prompt to generateContent
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
         // Not setting outputMimeType as it's not supported for nano banana models per instructions
      }
    });

    // Iterate parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated in response.");

  } catch (error) {
    console.error("Error transforming image:", error);
    throw new Error("Failed to transform image using Gemini 2.5 Flash Image.");
  }
};
