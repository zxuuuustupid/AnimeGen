'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  GenerationState,
  GenerationAction,
  GenerationStep,
  GenerationStatus,
} from './types';

const initialState: GenerationState = {
  sessionId: null,
  currentStep: 1,
  status: 'idle',
  uploadedImage: null,
  imageAnalysis: null,
  userIdea: null,
  generatedStory: null,
  comicPanels: null,
  videoUrl: null,
  progressMessage: '',
  error: null,
  videoError: null,
};

function generationReducer(
  state: GenerationState,
  action: GenerationAction
): GenerationState {
  switch (action.type) {
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.sessionId };
    case 'SET_IMAGE':
      return { ...state, uploadedImage: action.imageUrl };
    case 'SET_USER_IDEA':
      return { ...state, userIdea: action.idea };
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'SET_IMAGE_ANALYSIS':
      return { ...state, imageAnalysis: action.analysis };
    case 'SET_GENERATED_STORY':
      return { ...state, generatedStory: action.story };
    case 'SET_COMIC_PANELS':
      return { ...state, comicPanels: action.panels };
    case 'SET_VIDEO_URL':
      return { ...state, videoUrl: action.videoUrl };
    case 'SET_PROGRESS':
      return { ...state, progressMessage: action.message };
    case 'SET_ERROR':
      return { ...state, error: action.error, status: 'error' };
    case 'SET_VIDEO_ERROR':
      return { ...state, videoError: action.error === '' ? null : action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface GenerationContextType {
  state: GenerationState;
  dispatch: React.Dispatch<GenerationAction>;
  setSessionId: (id: string) => void;
  setImage: (url: string) => void;
  setUserIdea: (idea: string) => void;
  setStep: (step: GenerationStep) => void;
  setStatus: (status: GenerationStatus) => void;
  setImageAnalysis: (analysis: string) => void;
  setGeneratedStory: (story: string) => void;
  setComicPanels: (panels: string[]) => void;
  setVideoUrl: (url: string) => void;
  setProgress: (message: string) => void;
  setError: (error: string) => void;
  setVideoError: (error: string | null) => void;
  reset: () => void;
}

const GenerationContext = createContext<GenerationContextType | null>(null);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(generationReducer, initialState);

  const contextValue: GenerationContextType = {
    state,
    dispatch,
    setSessionId: (id) => dispatch({ type: 'SET_SESSION_ID', sessionId: id }),
    setImage: (url) => dispatch({ type: 'SET_IMAGE', imageUrl: url }),
    setUserIdea: (idea) => dispatch({ type: 'SET_USER_IDEA', idea }),
    setStep: (step) => dispatch({ type: 'SET_STEP', step }),
    setStatus: (status) => dispatch({ type: 'SET_STATUS', status }),
    setImageAnalysis: (analysis) =>
      dispatch({ type: 'SET_IMAGE_ANALYSIS', analysis }),
    setGeneratedStory: (story) =>
      dispatch({ type: 'SET_GENERATED_STORY', story }),
    setComicPanels: (panels) => dispatch({ type: 'SET_COMIC_PANELS', panels }),
    setVideoUrl: (url) => dispatch({ type: 'SET_VIDEO_URL', videoUrl: url }),
    setProgress: (message) => dispatch({ type: 'SET_PROGRESS', message }),
    setError: (error) => dispatch({ type: 'SET_ERROR', error }),
    setVideoError: (error) => dispatch({ type: 'SET_VIDEO_ERROR', error: error ?? '' }),
    reset: () => dispatch({ type: 'RESET' }),
  };

  return (
    <GenerationContext.Provider value={contextValue}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
