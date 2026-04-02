export type GenerationStep = 1 | 2 | 3 | 4 | 5;

export type GenerationStatus =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'generating_story'
  | 'generating_comics'
  | 'generating_video'
  | 'completed'
  | 'error';

export interface GenerationState {
  sessionId: string | null;
  currentStep: GenerationStep;
  status: GenerationStatus;

  // Data
  uploadedImage: string | null;
  imageAnalysis: string | null;
  userIdea: string | null;
  generatedStory: string | null;
  comicPanels: string[] | null;
  videoUrl: string | null;

  // Progress
  progressMessage: string;
  error: string | null;
  videoError: string | null;
}

export type GenerationAction =
  | { type: 'SET_SESSION_ID'; sessionId: string }
  | { type: 'SET_IMAGE'; imageUrl: string }
  | { type: 'SET_USER_IDEA'; idea: string }
  | { type: 'SET_STEP'; step: GenerationStep }
  | { type: 'SET_STATUS'; status: GenerationStatus }
  | { type: 'SET_IMAGE_ANALYSIS'; analysis: string }
  | { type: 'SET_GENERATED_STORY'; story: string }
  | { type: 'SET_COMIC_PANELS'; panels: string[] }
  | { type: 'SET_VIDEO_URL'; videoUrl: string }
  | { type: 'SET_PROGRESS'; message: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_VIDEO_ERROR'; error: string | null }
  | { type: 'RESET' };

export interface SessionData {
  id: string;
  createdAt: Date;
  imagePath: string | null;
  imageAnalysis: string | null;
  userIdea: string | null;
  generatedStory: string | null;
  comicPanels: string[] | null;
  videoPath: string | null;
  status: GenerationStatus;
}
