export interface HistoricalScene {
  id: string;
  name: string;
  prompt: string;
  icon: string; // Emoji or icon name
  description: string;
}

export interface AnalysisResult {
  description: string;
  detectedFeatures: string[];
}

export enum AppState {
  LANDING = 'LANDING',
  CAMERA = 'CAMERA',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
