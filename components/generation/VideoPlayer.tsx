'use client';

import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">生成的视频</h2>
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
