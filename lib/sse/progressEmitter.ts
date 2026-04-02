import { EventEmitter } from 'events';

interface ProgressPayload {
  stage: string;
  message: string;
  progress?: number; // 0-100
  detail?: string;
}

// In-memory event emitters per session
const emitters = new Map<string, EventEmitter>();

export function getProgressEmitter(sessionId: string): EventEmitter {
  if (!emitters.has(sessionId)) {
    emitters.set(sessionId, new EventEmitter());
  }
  return emitters.get(sessionId)!;
}

export function emitProgress(sessionId: string, payload: ProgressPayload) {
  const emitter = getProgressEmitter(sessionId);
  emitter.emit('progress', JSON.stringify(payload));
}

export function removeProgressEmitter(sessionId: string) {
  const emitter = emitters.get(sessionId);
  if (emitter) {
    emitter.removeAllListeners();
    emitters.delete(sessionId);
  }
}
