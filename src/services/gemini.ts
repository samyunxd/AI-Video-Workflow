import { GoogleGenAI, Type } from "@google/genai";

export interface ScenePrompt {
  id: number;
  scriptSegment: string;
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
  guidance: string;
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
  promptInstructions: string = "",
  guidanceInstructions: string = "",
  promptMode: string = "Structured Prompt",
  engine: string = "Gemini"
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
    ? `VIDEO MOTION & ACTION PRIORITY: For "videoPrompt", YOU MUST describe the SUBJECT'S ACTION in high detail. Describe exactly how subjects move, blink, breathe, gesture, or interact with their surroundings. Then, combine this with ONE camera movement from this list: [${allowedMotions.join(', ')}]. If "Static Camera" is selected, the camera remains fixed, but the SUBJECT MUST be active and moving to ensure the video feels alive.`
    : "VIDEO MOTION & ACTION PRIORITY: Describe professional cinematic subject actions and interactions inside the frame, combined with appropriate camera movements.";

  const shotTypeInstruction = allowedShotTypes.length > 0
    ? `CAMERA ANGLE CONSTRAINT: Start each "imagePrompt" with one of these shot types: ${allowedShotTypes.join(', ')}.`
    : "Start with a cinematic camera angle.";

  const strictInstruction = strictImage 
    ? `STRICT MODE: Describe only physical, visible details. No abstract metaphors.`
    : "";

  const multiviewInstruction = multiview 
    ? `ENFORCE MULTI-SHOT SEQUENCE: The "videoPrompt" MUST describe a sequence of shots AND ACTIONS within the scene duration. 
       - Use time markers like "[0-2s]: Subject starts action with fixed camera... [2-4s]: Subject transitions to new behavior..." 
       - If camera settings allow, switch angles. If "Static Camera" is restricted, keep the angle but evolve the subject's behavior.
       - Total time markers must sum up to ${secondsPerScene} seconds.
       - Describe different angles (Wide, Medium, Close-up) within this single video prompt.
       - DO NOT apply this multi-shot logic to "imagePrompt". The "imagePrompt" MUST remain a single, high-quality starting frame.`
    : "Standard single-view cinematic shots with high-priority subject action.";

  const promptModeInstruction = (function() {
    switch(promptMode) {
      case 'General Image Prompt':
        return 'IMAGE PROMPT STRATEGY: Write flowing, descriptive paragraphs. Focus on narrative and visual depth.';
      case 'Graphic Design':
        return 'IMAGE PROMPT STRATEGY: Focus on vector art, flat design, typography, brand aesthetics, and clean layouts.';
      case 'JSON':
        return 'IMAGE PROMPT STRATEGY: Wrap visual descriptions in a technical, data-like format (e.g. "Subject: {details}, Atmosphere: {details}").';
      case 'Structured Prompt':
      default:
        return 'IMAGE PROMPT STRATEGY: Use a comma-separated list of visual elements. Start with composition/shot type.';
    }
  })();

  const engineInstruction = (function() {
    switch(engine) {
      case 'Flux':
        return 'TARGET ENGINE (FLUX): Optimized for complex natural language and photorealism. Be descriptive about textures and light interactions.';
      case 'Midjourney':
        return 'TARGET ENGINE (MIDJOURNEY): Use aesthetic keywords. Append stylized tags. Focus on composition and mood. Mention aspect ratios if relevant.';
      case 'Stable Diffusion':
        return 'TARGET ENGINE (STABLE DIFFUSION): Use prioritized keywords and weights. Focus on tags like "masterpiece", "trending on artstation", etc.';
      case 'Gemini':
      default:
        return 'TARGET ENGINE (GEMINI): Use detailed, conversational, and context-aware descriptions.';
    }
  })();

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
5. imagePrompt FORMAT: ${promptModeInstruction}

ENGINE OPTIMIZATION: ${engineInstruction}

REQUIRED FIELDS:
- "scriptSegment": The literal text covered.
- "imagePrompt": The descriptive list. YOU MUST APPEND the scene-specific negative prompt at the end using: " --no [calculated negative prompt]".
- "videoPrompt": Motion description using ${motionInstruction}.
- "negativePrompt": A SMART, context-aware negative prompt. USE the global input (${negativePrompt}) as a baseline, but ADD scene-specific exclusions. For example, if the scene is a quiet interior, add "street noise, bright sunlight". If it's a close-up, add "distracting background details". DO NOT just copy-paste the global prompt; make it unique to what SHOULD NOT be in this specific frame.
- "guidance": DIRECTOR'S GUIDANCE. Act as the World Simulation Director. Your goal is to manage physical continuity and state updates. 
  * RULES OF REALITY: 
    - Identify if this scene is a CONTINUATION (80-90% of cases), TRANSITION, or HARD CUT.
    - Treat scenes as "state updates of a continuous world simulation".
    - Focus on the BOOKEND SYSTEM: 
        a) FIRST FRAME (Restoration Instruction): Tell the user how to restore the exact spatial state and character placement from the previous scene's end. 
        b) LAST FRAME (State Export): Define where everything ends up spatially and the direction of movement for the next scene to inherit.
    - Guidance must be technical and actionable, explaining HOW to maintain stable identities, lighting, and camera setups.
    - Use the following user-defined guidelines for the specific project tone: [${guidanceInstructions || "No additional specific guidance instructions provided."}].

${shotTypeInstruction}
${strictInstruction}

STYLE OVERRIDE: Incorporate "${style}" into every imagePrompt.

USER CUSTOM PROMPT INSTRUCTIONS:
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
            guidance: { type: Type.STRING },
          },
          required: ["id", "scriptSegment", "imagePrompt", "videoPrompt", "negativePrompt", "guidance"],
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
