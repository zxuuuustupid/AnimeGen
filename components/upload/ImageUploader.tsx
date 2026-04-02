'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';

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
      if (file) await uploadFile(file);
    },
    [sessionId]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await uploadFile(file);
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
    <div style={{ width: '100%' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--sv-radius-xl)',
          border: isDragging
            ? '2px solid var(--sv-primary)'
            : '2px dashed var(--sv-outline)',
          padding: preview ? '12px' : '48px 24px',
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          background: isDragging
            ? 'var(--sv-primary-light)'
            : 'var(--sv-surface-dim)',
          cursor: 'pointer',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '280px',
              borderRadius: 'var(--sv-radius-lg)',
              overflow: 'hidden',
              background: 'var(--sv-surface-container)',
            }}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
            {/* Change image overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.45)',
                opacity: 0,
                transition: 'opacity 0.2s',
                borderRadius: 'var(--sv-radius-lg)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
            >
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                点击更换图片
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Upload icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--sv-primary-container)',
                animation: isDragging ? 'sv-float 1.5s ease-in-out infinite' : 'none',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sv-on-primary-container)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--sv-on-surface)', marginBottom: '4px' }}>
                {isDragging ? '松开以上传图片' : '拖拽图片到这里，或点击选择'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--sv-on-surface-variant)' }}>
                支持 JPG、PNG、WEBP，最大 10MB
              </p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '14px',
            color: 'var(--sv-primary)',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--sv-primary)',
                  animation: 'sv-dot-pulse 1.4s infinite ease-in-out both',
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
          上传中...
        </div>
      )}
    </div>
  );
}
