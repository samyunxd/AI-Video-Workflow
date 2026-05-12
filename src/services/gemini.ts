import { GoogleGenAI, Type } from "@google/genai";

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
  wordsPerSecond: number = 2,
  allowedMotions: string[] = ['Static Camera'],
  strictImage: boolean = false,
  allowedShotTypes: string[] = ['Wide Shot', 'Medium Shot', 'Close-up'],
  promptInstructions: string = ""
): Promise<ScenePrompt[]> {
  // Use custom key if provided, otherwise fallback to env
  // Access process.env safely to avoid ReferenceError in Vite production
  const envKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
  const apiKey = customApiKey || envKey;

  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a Gemini API Key in the settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const motionInstruction = allowedMotions.length > 0 
    ? `MOTION CONSTRAINT: Use only these camera movements for "videoPrompt": ${allowedMotions.join(', ')}.`
    : "Use professional cinematic camera movements.";

  const shotTypeInstruction = allowedShotTypes.length > 0
    ? `CAMERA ANGLE CONSTRAINT: Start each "imagePrompt" with one of these shot types: ${allowedShotTypes.join(', ')}.`
    : "Start with a cinematic camera angle.";

  const strictInstruction = strictImage 
    ? `STRICT MODE: Describe only physical, visible details. No abstract metaphors.`
    : "";

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
Break the script into EXACTLY one row per visual beat.

STRICT RULES:
1. FULL COVERAGE: Cover 100% of the script. No skips.
2. DISCRETE SEGMENTS: YOU MUST generate AT LEAST ${expectedSceneCount} rows. If the script is complex, generate more.
3. PACING & BALANCE: Each "scriptSegment" SHOULD be approximately ${wordsPerScene} words (±20%). NEVER put more than ${Math.ceil(wordsPerScene * 1.5)} words in a single row. If the remaining text is large, split it into multiple rows until the end. DO NOT RUSH THE ENDING.
4. SCRIPT SEGMENT: The "scriptSegment" field MUST contain the EXACT, ORIGINAL LITERAL TEXT from the input script for that beat. DO NOT summarize, paraphrase, or take shortcuts.
5. imagePrompt FORMAT: Create a rich, descriptive list of visual elements separated by commas. 
   EXAMPLE PATTERN: "[Shot Type], [Subject description], [Atmosphere/Environment], [Lighting], [Textural details], [Style keywords]"
   INSPIRATION: "Busy 1700s Lisbon harbor filled with large Portuguese trading ships, towering wooden galleons, creaking timber docks, crashing Atlantic waves, sailors shouting, ropes and barrels, dramatic cloudy sky, cinematic realism, rich textures, golden morning light, 4k masterpiece."

REQUIRED FIELDS:
- "scriptSegment": The literal text covered.
- "imagePrompt": The descriptive list. YOU MUST APPEND THE NEGATIVE PROMPT AT THE END using: " --no ${negativePrompt}".
- "videoPrompt": Motion description using ${motionInstruction}.
- "negativePrompt": The global negative prompt (${negativePrompt}).

${shotTypeInstruction}
${strictInstruction}

STYLE OVERRIDE: Incorporate "${style}" into every imagePrompt.

USER CUSTOM INSTRUCTIONS:
${promptInstructions || "No additional specific instructions."}

Output: JSON array of objects.`;

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
