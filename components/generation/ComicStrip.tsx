'use client';

import React from 'react';
import Image from 'next/image';

interface ComicStripProps {
  panels: string[];
}

export function ComicStrip({ panels }: ComicStripProps) {
  if (!panels || panels.length === 0) {
    return <p className="text-gray-500">暂无漫画</p>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">生成的漫画</h2>
      <div className="grid grid-cols-2 gap-4">
        {panels.map((panel, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
          >
            <Image
              src={panel}
              alt={`漫画面板 ${index + 1}`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
