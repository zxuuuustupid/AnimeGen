'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  sessionId: string;
  currentImage?: string | null;
}

export function ImageUploader({
  onImageUpload,
  sessionId,
  currentImage,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await uploadFile(file);
      }
    },
    [sessionId]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadFile(file);
      }
    },
    [sessionId]
  );

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.filePath);
        onImageUpload(data.filePath);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
        } ${preview ? 'cursor-pointer' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-64">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-6xl">📷</div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              拖拽图片到这里，或点击选择
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              支持 JPG、PNG、WEBP，最大 10MB
            </p>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
          上传中...
        </div>
      )}
    </div>
  );
}
