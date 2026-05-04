import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScenePrompt {
  id: number;
  scriptSegment: string;
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
}

export async function generateBulkPrompts(
  script: string,
  style: string,
  secondsPerScene: number,
  multiview: boolean = false,
  negativePrompt: string = "",
  customApiKey?: string,
  wordsPerSecond: number = 2
): Promise<ScenePrompt[]> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a Gemini API Key.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const multiviewInstruction = multiview 
    ? `ENFORCE MULTI-SHOT SEQUENCE: The "videoPrompt" MUST describe a sequence of shots within the scene duration. 
       - Use time markers like "[0-2s]: Shot description... [2-4s]: Next shot..." 
       - Total time markers must sum up to ${secondsPerScene} seconds.
       - Describe different angles (Wide, Medium, Close-up) within this single video prompt.
       - DO NOT apply this multi-shot logic to "imagePrompt". The "imagePrompt" MUST remain a single, high-quality starting frame.`
    : "Standard single-view cinematic shots.";

  const scriptWordCount = script.split(/\s+/).length;
  const wordsPerScene = Math.max(1, Math.round(wordsPerSecond * secondsPerScene));
  const expectedSceneCount = Math.ceil(scriptWordCount / wordsPerScene);

  const systemInstruction = `You are an expert cinematic prompt engineer for AI video generation.
Your task is to analyze the provided script and break it down into a PRECISE series of visual segments covering the ENTIRE script from start to finish.

STRICT COVERAGE RULE:
- YOU MUST COVER THE ENTIRE SCRIPT. NO OMISSIONS.
- Divide the total text into logical, chronological segments reflecting the timing below.
- Script Size: ~${scriptWordCount} words.
- Target Duration: ${secondsPerScene}s per scene (~${wordsPerScene} words/scene).
- REQUIRED COUNT: You MUST generate approximately ${expectedSceneCount} distinct scene rows.

ONE ROW = ONE IMAGE:
- Each row represents exactly ONE visual segment.
- "scriptSegment": The literal portion of the script this scene covers.
- "imagePrompt": A detailed single-frame starting prompt (Style: ${style}).
- "videoPrompt": Motion description for this specific segment.
- "negativePrompt": Exclusions (Global: ${negativePrompt}).

LAYOUT/SEQUENCE MODE: ${multiviewInstruction}

CONSISTENCY IS PARAMOUNT. Characters, settings, and lighting must remain stable across all segments to ensure video continuity.
Output as a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Generate cinematic prompts for this script:\n\n${script}` }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            scriptSegment: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            videoPrompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
          },
          required: ["id", "scriptSegment", "imagePrompt", "videoPrompt", "negativePrompt"],
        },
      },
    },
  });

  try {
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
}
