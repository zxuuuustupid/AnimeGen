import { NextRequest } from 'next/server';
import { getProgressEmitter, removeProgressEmitter } from '@/lib/sse/progressEmitter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  const encoder = new TextEncoder();
  const emitter = getProgressEmitter(sessionId);

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: {"type":"connected"}\n\n`));

      const onProgress = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Stream closed
        }
      };

      emitter.on('progress', onProgress);

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        emitter.removeListener('progress', onProgress);
        removeProgressEmitter(sessionId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
