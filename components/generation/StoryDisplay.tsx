'use client';

import React from 'react';

interface StoryDisplayProps {
  story: string;
}

export function StoryDisplay({ story }: StoryDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(story);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">生成的故事</h2>
        <button
          onClick={handleCopy}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          复制
        </button>
      </div>
      <div className="prose dark:prose-invert max-w-none p-6 bg-gray-50 dark:bg-gray-900 rounded-xl whitespace-pre-wrap">
        {story}
      </div>
    </div>
  );
}
