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
  allowedShotTypes: string[] = ['Wide Shot', 'Medium Shot', 'Close-up']
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
    ? `MOTION CONSTRAINT: You MUST only use these camera movements for "videoPrompt": ${allowedMotions.join(', ')}. 
       If "Static Camera" is selected, use it for scenes with no significant action. 
       Mix the other selected motions creatively to match the scene energy.`
    : "Use cinematic camera movements.";

  const shotTypeInstruction = allowedShotTypes.length > 0
    ? `CAMERA ANGLE/SHOT TYPE CONSTRAINT: You MUST only use these shot types for the "Composition" pillar in "imagePrompt": ${allowedShotTypes.join(', ')}. 
       Vary these selected shot types across the sequence to maintain visual interest.`
    : "Use professional cinematic camera angles.";

  const strictInstruction = strictImage 
    ? `STRICT VISUAL RULE: Every single detail in the "imagePrompt" must be LITERALLY reproducible. 
       Avoid all metaphorical, abstract, or poetic language. 
       Describe ONLY visible, physical surfaces, lighting parameters, and camera settings. 
       If you describe a "mood", you MUST immediately follow it with the specific lighting and color choices that create it physically.`
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

  const systemInstruction = `You are an expert cinematic prompt engineer for AI video generation, specializing in high-end documentary and cinematic aesthetics.
Your task is to analyze the provided script and break it down into a PRECISE series of visual segments covering the ENTIRE script from start to finish.

STRICT COVERAGE & SEGMENTATION RULE:
- YOU MUST COVER THE ENTIRE SCRIPT. NO OMISSIONS.
- Divide the total text into logical, chronological segments reflecting the timing below.
- SINGLE SHOT PER ROW: One "id" row = One specific visual story beat. 
- DO NOT COMPRESS: Do not merge multiple distinct actions or script sentences into a single prompt row if they deserve their own visual moment.
- Script Size: ~${scriptWordCount} words.
- Target Duration: ${secondsPerScene}s per scene (~${wordsPerScene} words/scene).
- REQUIRED COUNT: You MUST generate approximately ${expectedSceneCount} distinct scene rows to ensure full granularity.

PROMPT ENGINEERING GUIDELINES for "imagePrompt":
For each image, you MUST follow these 8 pillars to ensure a cinematic/documentary feel:
1. Subject + Context: Be hyper-specific about who, where, and the exact moment. (e.g., "An elderly craftsman with oil-stained hands leaning over a vintage watch...")
2. Lighting: Describe directional, natural, or imperfect light. (e.g., "raking sidelight through a dusty window", "harsh midday desert light")
3. Camera + Lens: Specify focal length and texture. (e.g., "Shot on 35mm lens, shallow depth of field, slight film grain, handheld feel")
4. Composition: Define framing and relationship. (e.g., "extreme close-up", "low angle tracking shot", "wide environmental portrait")
5. Texture + Detail: Add authenticity cues. (e.g., "weathered skin", "worn wood surfaces", "dust motes in the air")
6. Color Palette: Use professional color language. (e.g., "desaturated earthy tones", "muted highlights", "gritty documentary grade")
7. Emotional Tone: Explicitly state the mood. (e.g., "raw urgency", "quiet dignity", "solitude")
8. Style Reference: Anchor to a professional aesthetic. (e.g., "In the style of Magnum Photos", "National Geographic 1990s documentary style")

REQUIRED STYLE OVERRIDE:
- All image prompts MUST incorporate the user's global style: "${style}".

ONE ROW = ONE SINGULAR IMAGE:
- Each row represents exactly ONE visual segment.
- "scriptSegment": The literal portion of the script this specific scene covers.
- "imagePrompt": A highly detailed prompt combining the 8 pillars above. Focus on ONE clear image. YOU MUST APPEND THE NEGATIVE PROMPT TO THE END of this specific field using the format: " [Main Prompt Content] --no [Negative Prompt Content]".
- "videoPrompt": Motion description for this specific segment (camera movement, subject action).
- "negativePrompt": Exclusions (Global: ${negativePrompt}). This should still contain just the negative words for reference.

${strictInstruction}

${shotTypeInstruction}

${motionInstruction}

SHOT MODE: ${multiviewInstruction}
- ABSOLUTELY NO MULTIPLE SCENES: Each row must focus on the specific text in its "scriptSegment". Do not jump forward in the story within one row.

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
