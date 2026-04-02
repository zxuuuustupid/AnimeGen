'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ModelOption, Provider, PROVIDERS, VISION_MODELS, TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/models';

interface ModelSelectorProps {
  label: string;
  models: ModelOption[];
  selectedModel: string;
  selectedProvider: Provider;
  onModelChange: (modelId: string) => void;
  onProviderChange: (provider: Provider) => void;
  customBaseUrl?: string;
  customApiKey?: string;
  onCustomBaseUrlChange?: (url: string) => void;
  onCustomApiKeyChange?: (key: string) => void;
}

export function ModelSelector({
  label,
  models,
  selectedModel,
  selectedProvider,
  onModelChange,
  onProviderChange,
  customBaseUrl = '',
  customApiKey = '',
  onCustomBaseUrlChange,
  onCustomApiKeyChange,
}: ModelSelectorProps) {
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const isCustomProvider = selectedProvider === 'custom';
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableProviders = [...new Set(models.map(m => m.provider))];
  if (!availableProviders.includes('custom')) {
    availableProviders.push('custom');
  }

  const filteredModels = models.filter(m => m.provider === selectedProvider);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProviderDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--sv-outline)',
    borderRadius: 'var(--sv-radius-md)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--sv-on-surface)',
    fontSize: '13px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  };

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--sv-primary)';
    e.target.style.boxShadow = '0 0 0 3px var(--sv-primary-light)';
  };

  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--sv-outline)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--sv-on-surface)',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </label>

      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Provider Chip Selector */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '10px 14px',
              border: '1.5px solid var(--sv-outline)',
              borderRadius: 'var(--sv-radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--sv-on-surface)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              minWidth: '140px',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--sv-primary)';
            }}
            onMouseLeave={(e) => {
              if (!showProviderDropdown) e.currentTarget.style.borderColor = 'var(--sv-outline)';
            }}
          >
            <span>{PROVIDERS[selectedProvider]?.name || '选择供应商'}</span>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--sv-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{
                transform: showProviderDropdown ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showProviderDropdown && (
            <div
              className="sv-animate-scale-in"
              style={{
                position: 'absolute',
                zIndex: 20,
                marginTop: '4px',
                width: '200px',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                border: '1px solid var(--sv-outline-variant)',
                borderRadius: 'var(--sv-radius-md)',
                boxShadow: 'var(--sv-shadow-xl)',
                overflow: 'hidden',
              }}
            >
              {availableProviders.map(provider => (
                <button
                  key={provider}
                  onClick={() => {
                    onProviderChange(provider);
                    setShowProviderDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: selectedProvider === provider ? 600 : 400,
                    color: selectedProvider === provider ? 'var(--sv-primary)' : 'var(--sv-on-surface)',
                    background: selectedProvider === provider ? 'var(--sv-primary-light)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProvider !== provider) {
                      e.currentTarget.style.background = 'var(--sv-surface-container)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProvider !== provider) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {selectedProvider === provider && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sv-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {PROVIDERS[provider]?.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Selector */}
        {!isCustomProvider ? (
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            style={{
              ...inputStyle,
              flex: 1,
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235F6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '36px',
            }}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          >
            <option value="">选择模型</option>
            {filteredModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder="输入模型名称，如 glm-4-flash"
            style={{ ...inputStyle, flex: 1 }}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          />
        )}
      </div>

      {/* Custom Provider Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--sv-on-surface-variant)',
              marginBottom: '4px',
            }}
          >
            API 地址
          </label>
          <input
            type="text"
            value={customBaseUrl}
            onChange={(e) => onCustomBaseUrlChange?.(e.target.value)}
            placeholder="https://api.example.com/v1"
            style={inputStyle}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--sv-on-surface-variant)',
              marginBottom: '4px',
            }}
          >
            API 密钥
          </label>
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => onCustomApiKeyChange?.(e.target.value)}
            placeholder="sk-..."
            style={inputStyle}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          />
        </div>
      </div>
    </div>
  );
}

interface GenerationConfigEditorProps {
  visionModel: string;
  textModel: string;
  imageModel: string;
  videoModel: string;
  visionProvider: Provider;
  textProvider: Provider;
  imageProvider: Provider;
  videoProvider: Provider;
  visionBaseUrl?: string;
  visionApiKey?: string;
  textBaseUrl?: string;
  textApiKey?: string;
  imageBaseUrl?: string;
  imageApiKey?: string;
  videoBaseUrl?: string;
  videoApiKey?: string;
  onChange: (config: Partial<{
    visionModel: string;
    textModel: string;
    imageModel: string;
    videoModel: string;
    visionProvider: Provider;
    textProvider: Provider;
    imageProvider: Provider;
    videoProvider: Provider;
    visionBaseUrl: string;
    visionApiKey: string;
    textBaseUrl: string;
    textApiKey: string;
    imageBaseUrl: string;
    imageApiKey: string;
    videoBaseUrl: string;
    videoApiKey: string;
  }>) => void;
  onClose: () => void;
}

export function GenerationConfigEditor({
  visionModel,
  textModel,
  imageModel,
  videoModel,
  visionProvider,
  textProvider,
  imageProvider,
  videoProvider,
  visionBaseUrl = '',
  visionApiKey = '',
  textBaseUrl = '',
  textApiKey = '',
  imageBaseUrl = '',
  imageApiKey = '',
  videoBaseUrl = '',
  videoApiKey = '',
  onChange,
  onClose,
}: GenerationConfigEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sectionLabels = [
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>, label: '图像分析模型 (Vision)' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>, label: '文本生成模型 (Text)' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>, label: '图像生成模型 (Image)' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>, label: '视频生成模型 (Video)' },
  ];

  const sections = [
    {
      ...sectionLabels[0],
      models: VISION_MODELS,
      selectedModel: visionModel,
      selectedProvider: visionProvider,
      onModelChange: (model: string) => onChange({ visionModel: model }),
      onProviderChange: (provider: Provider) => onChange({ visionProvider: provider }),
      customBaseUrl: visionBaseUrl,
      customApiKey: visionApiKey,
      onCustomBaseUrlChange: (url: string) => onChange({ visionBaseUrl: url }),
      onCustomApiKeyChange: (key: string) => onChange({ visionApiKey: key }),
    },
    {
      ...sectionLabels[1],
      models: TEXT_MODELS,
      selectedModel: textModel,
      selectedProvider: textProvider,
      onModelChange: (model: string) => onChange({ textModel: model }),
      onProviderChange: (provider: Provider) => onChange({ textProvider: provider }),
      customBaseUrl: textBaseUrl,
      customApiKey: textApiKey,
      onCustomBaseUrlChange: (url: string) => onChange({ textBaseUrl: url }),
      onCustomApiKeyChange: (key: string) => onChange({ textApiKey: key }),
    },
    {
      ...sectionLabels[2],
      models: IMAGE_MODELS,
      selectedModel: imageModel,
      selectedProvider: imageProvider,
      onModelChange: (model: string) => onChange({ imageModel: model }),
      onProviderChange: (provider: Provider) => onChange({ imageProvider: provider }),
      customBaseUrl: imageBaseUrl,
      customApiKey: imageApiKey,
      onCustomBaseUrlChange: (url: string) => onChange({ imageBaseUrl: url }),
      onCustomApiKeyChange: (key: string) => onChange({ imageApiKey: key }),
    },
    {
      ...sectionLabels[3],
      models: VIDEO_MODELS,
      selectedModel: videoModel,
      selectedProvider: videoProvider,
      onModelChange: (model: string) => onChange({ videoModel: model }),
      onProviderChange: (provider: Provider) => onChange({ videoProvider: provider }),
      customBaseUrl: videoBaseUrl,
      customApiKey: videoApiKey,
      onCustomBaseUrlChange: (url: string) => onChange({ videoBaseUrl: url }),
      onCustomApiKeyChange: (key: string) => onChange({ videoApiKey: key }),
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 500,
          border: '1.5px solid var(--sv-outline)',
          borderRadius: 'var(--sv-radius-full)',
          background: 'var(--sv-surface)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'var(--sv-on-surface)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--sv-primary)';
          e.currentTarget.style.background = 'var(--sv-primary-light)';
          e.currentTarget.style.color = 'var(--sv-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--sv-outline)';
          e.currentTarget.style.background = 'var(--sv-surface)';
          e.currentTarget.style.color = 'var(--sv-on-surface)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        模型设置
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="sv-animate-scale-in"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 'var(--sv-radius-xl)',
              boxShadow: 'var(--sv-shadow-2xl)',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--sv-outline-variant)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 28px 20px',
                borderBottom: '1px solid var(--sv-outline-variant)',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--sv-on-surface)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  AI 模型配置
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--sv-on-surface-variant)', marginTop: '2px' }}>
                  为每个生成步骤选择 AI 模型和供应商
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--sv-surface-container)',
                  color: 'var(--sv-on-surface-variant)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--sv-surface-container-high)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--sv-surface-container)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sections.map((section, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--sv-radius-lg)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--sv-primary-light)',
                          color: 'var(--sv-primary)',
                        }}
                      >
                        {section.icon}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sv-on-surface)' }}>
                        {section.label}
                      </span>
                    </div>
                    <ModelSelector
                      label=""
                      models={section.models}
                      selectedModel={section.selectedModel}
                      selectedProvider={section.selectedProvider}
                      onModelChange={section.onModelChange}
                      onProviderChange={section.onProviderChange}
                      customBaseUrl={section.customBaseUrl}
                      customApiKey={section.customApiKey}
                      onCustomBaseUrlChange={section.onCustomBaseUrlChange}
                      onCustomApiKeyChange={section.onCustomApiKeyChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '16px 28px 24px',
                borderTop: '1px solid var(--sv-outline-variant)',
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 28px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: 'var(--sv-radius-full)',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--sv-gradient-start), var(--sv-gradient-mid))',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: 'var(--sv-shadow-md)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--sv-shadow-xl)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--sv-shadow-md)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                保存并关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}