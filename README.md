# AI Video Workflow V2.0

A professional batch processing tool designed for cinematic prompt engineering. This application transforms long-form scripts into a precise, time-coded sequence of image and motion prompts optimized for AI video generation.

---

## 🌟 What's New (v2.0 Release)

*   **Custom Prompt Instructions**: New dedicated area for global rules and artistic directives.
*   **Engine-Specific Tuning**: Tailored output profiles for **Flux, Midjourney, Stable Diffusion,** and **Gemini**.
*   **Flexible UI Architecture**: Collapsible settings bar with a smart 10-column dynamic grid.
*   **New Prompt Modes**: Choose between **Structured, General, Graphic Design,** or **JSON** formats.
*   **UI Polish**: Added "Aesthetic" custom scrollbars and density-focused layouts for professional use.
*   **Pacing Logic**: Enhanced script distribution to ensure smooth narrative flow even in complex ending segments.

---

## 🚀 Quick Start

1. **Enter Your Gemini API Key**: Paste your key in the header. For security, it is stored only in your local session.
2. **Input Script**: Paste your documentary or narrative script into the **01. Script** box.
3. **Set the Vibe**: Describe your desired visual style in **02. Style** (e.g., "1970s grainy film, warm sunset lighting").
4. **Generate**: Click **Generate Sequences** to see your script broken down into visual beats.

---

## 🛠 Features Guide

### 01-04: The Global Context
*   **Script**: The raw text that drives the narrative. The engine ensures 100% coverage with no skips.
*   **Style**: The "Art Direction" anchor. This is appended to every single prompt to ensure visual consistency across the entire video.
*   **Negative**: Things you want to avoid (e.g., "text, watermarks, blurry, 3d render").
*   **Instructions**: Custom rules for the AI (e.g., "Ensure all characters wear blue", "Focus on close-ups for emotional moments").

### 05-06: Engine & Mode Tuning

#### 🎨 Prompt Modes
The Prompt Mode determines the linguistic structure of the generated description. Choosing the right mode depends on which AI model you are using for image generation.

*   **`Structured Prompt` (Default)**: Uses a clean, comma-separated list of visual elements. Perfect for models that respond well to "tag-based" prompting.
    *   *Example*: `Medium Shot, Astronaut on Mars, red dust swirling, sharp focus, cinematic lighting, 8k.`
*   **`General Image Prompt`**: Generates a flowing, descriptive narrative paragraph. Best for models that understand complex natural language.
    *   *Example*: `A medium shot depicts a lone astronaut standing on the surface of Mars. Fine red dust swirls around their boots as the harsh, direct sunlight creates long shadows across the cratered landscape.`
*   **`Graphic Design`**: Optimized for vector art, flat design, and clean layouts. Focuses on shapes, colors, and balance.
    *   *Example*: `Minimalist vector illustration of an astronaut on Mars, flat orange and black palette, clean geometric lines, high-contrast silhouette against a red sky.`
*   **`JSON`**: Wraps visual descriptions in a technical, data-like format for developers or custom automation pipelines.
    *   *Example*: `{"shot": "medium", "subject": "astronaut", "environment": "Mars surface", "atmosphere": "dusty"}`

#### ⚙️ Engine Optimization
Beyond structure, the engine tunes the *content* of the prompt to match the specific quirks and training data of the world's leading AI image models.

*   **`Flux`**: Optimized for complex, natural language descriptions and photorealistic textures. It emphasizes physical interactions and subtle lighting details.
*   **`Midjourney`**: Focuses on artistic mood and stylistic keywords. It leans into aesthetic descriptors (e.g., "ethereal", "hyper-detailed") and composition-heavy phrasing.
*   **`Stable Diffusion`**: Prioritizes keyword ordering and uses "high-weight" tokens commonly found in SD community models (e.g., "Trending on Artstation", "Unreal Engine 5").
*   **`Gemini`**: A balanced, conversational approach that uses the model's inherent understanding of context to create highly versatile and accurate descriptions.

### 07: Dynamics & Logic
*   **Duration**: Set how long each visual segment should last.
*   **Words/Sec**: Adjust the "Speaking Rate" to control how much script is packed into one scene.
*   **Strict Mode**: Disables metaphorical language. Recommended for high-precision engines that struggle with abstractions.
*   **Multiview**: Prepares the AI to think in terms of multi-shot compositions.

### 08-09: Shot & Motion profiles
*   **Camera Angles**: Select the lens types you want the AI to cycle through (Wide, Extreme Close-up, Low Angle, etc.).
*   **Motion**: Select cinematic movements (Tracking Shot, Pan Right, Rack Focus) for the video generation phase.

---

## 💡 Best Practices for Best Results

### 1. The Stability Secret
Use the **Style Anchor** to describe the "Film Stock" and "Lighting". If you mention "Shot on 35mm, Kodak Portra 400" in the Style box, your characters remain much more consistent than if you try to describe the film for every scene manually.

### 2. Balancing the Script
If you find one segment has too much text (hard to read), increase your **Duration** or decrease your **Words per Second** before generating. The engine is tuned to balance the script evenly.

### 3. Using Strict Mode
If you are getting "dreamy" or "abstract" images when you want realistic ones, turn on **Strict Mode**. It forces the AI to describe the physical surface of objects instead of the "feeling" of the scene.

### 4. Workflow Export
Once generated, use the **Export CSV** button. This file is formatted to be easily imported into spreadsheets or custom video automation pipelines.

---

## 🎹 Navigation Tips
*   **Collapse Settings**: Use the gear icon in the header to hide the configuration bar and maximize your workspace.
*   **Copy Buttons**: Every script segment, image prompt, and motion description has a one-click copy button for quick transfer to your video generation tool.
*   **Auto-Save**: All your settings, checkboxes, and keys are automatically saved to your browser's local storage. You can close the tab and return later without losing your configuration.
