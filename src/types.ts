import { ScenePrompt } from './services/gemini';

export interface WorkspaceData {
  script: string;
  style: string;
  negativePrompt: string;
  secondsPerScene: number;
  wordsPerSecond: number;
  multiview: boolean;
  strictImage: boolean;
  promptInstructions: string;
  promptMode: string;
  engine: string;
  selectedMotions: string[];
  selectedShotTypes: string[];
  scenes: ScenePrompt[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  createdAt: number;
  updatedAt: number;
  data: WorkspaceData;
}
