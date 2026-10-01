'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

// ─── Shared model catalog (single source of truth) ─────────────────────────
export const ALL_PROVIDERS = [
  {
    id: 'assistant',
    name: 'Assistant',
    icon: '✦',
    color: '#a78bfa',
    models: [
      { id: 'gpt-5-mini', name: 'GPT-5 Mini', tag: 'Recommended' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: 'G',
    color: '#34d399',
    models: [
      { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash', tag: 'Fast' },
      { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
      { id: 'gemini-3-5-flash', name: 'Gemini 3.5 Flash' },
      { id: 'gemini-3-5-flash-openai', name: 'Gemini 3.5 Flash (OpenAI compat)' },
      { id: 'gemini-3-6-flash', name: 'Gemini 3.6 Flash' },
      { id: 'gemini-3-6-flash-openai', name: 'Gemini 3.6 Flash (OpenAI compat)' },
      { id: 'gemini-3-1-pro', name: 'Gemini 3.1 Pro' },
      { id: 'gemini-3-pro', name: 'Gemini 3 Pro' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '✳',
    color: '#f59e0b',
    models: [
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', tag: 'Latest' },
      { id: 'claude-sonnet-5', name: 'Claude Sonnet 5' },
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5' },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
      { id: 'claude-opus-4-7', name: 'Claude Opus 4.7' },
      { id: 'claude-opus-4-8', name: 'Claude Opus 4.8' },
      { id: 'claude-opus-5', name: 'Claude Opus 5' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
      { id: 'claude-fable-5', name: 'Claude Fable 5' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '⚙',
    color: '#60a5fa',
    models: [
      { id: 'gpt-5-mini', name: 'GPT-5 Mini', tag: 'Fast' },
      { id: 'gpt-5-nano', name: 'GPT-5 Nano' },
      { id: 'gpt-5-2', name: 'GPT-5.2' },
      { id: 'gpt-5-4', name: 'GPT-5.4' },
      { id: 'gpt-5-5', name: 'GPT-5.5' },
      { id: 'gpt-5-6-luna', name: 'GPT-5.6 Luna' },
      { id: 'gpt-5-6-sol', name: 'GPT-5.6 Sol' },
      { id: 'gpt-5-6-terra', name: 'GPT-5.6 Terra' },
      { id: 'gpt-codex', name: 'GPT Codex' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    icon: '◈',
    color: '#f87171',
    models: [
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', tag: 'Fast' },
      { id: 'kimi-k3', name: 'Kimi K3' },
    ],
  },
];

// Helper — find provider + model object by model ID
export function getProviders(models) {
  if (!models?.length) return ALL_PROVIDERS;
  const groups = new Map();
  for (const model of models) {
    if (model.is_available === false) continue;
    const name = model.provider || 'Configured provider';
    if (!groups.has(name)) {
      groups.set(name, { id: name, name, icon: '✦', color: '#a78bfa', models: [] });
    }
    groups.get(name).models.push({ ...model, tag: model.recommended ? 'Recommended' : undefined });
  }
  return groups.size ? [...groups.values()] : ALL_PROVIDERS;
}

export function findModel(modelId, providers = ALL_PROVIDERS) {
  for (const provider of providers) {
    const found = provider.models.find((m) => m.id === modelId);
    if (found) return { provider, model: found };
  }
  return null;
}

// ─── ModelPicker (chat header) ─────────────────────────────────────────────
export default function ModelPicker({ currentModel, onSelectModel, models }) {
  const providers = useMemo(() => getProviders(models), [models]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assistant');
  const dropdownRef = useRef(null);

  // Auto-switch provider tab to match the currently selected model
  useEffect(() => {
    const found = findModel(currentModel, providers);
    if (found) setActiveTab(found.provider.id);
  }, [currentModel, providers]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProvider = providers.find((p) => p.id === activeTab) || providers[0];
  const currentInfo = findModel(currentModel, providers);
  const displayName = currentInfo?.model?.name || currentModel || 'Select Model';
  const displayIcon = currentInfo?.provider?.icon || 'Ø';
  const displayColor = currentInfo?.provider?.color || '#a78bfa';

  return (
    <div className="relative z-50" ref={dropdownRef} suppressHydrationWarning={true}>
      <button
        suppressHydrationWarning={true}
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost gap-1.5 py-1.5 text-xs"
      >
        <span className="font-mono text-[11px] font-bold" style={{ color: displayColor }}>{displayIcon}</span>
        <span className="max-w-[140px] truncate font-medium text-fg">{displayName}</span>
        <FiChevronDown className={`text-xs text-fg-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="surface absolute right-0 z-50 mt-2 flex w-[320px] overflow-hidden shadow-pop animate-fade-in" suppressHydrationWarning={true}>
          <div className="flex w-12 flex-shrink-0 flex-col items-center gap-1.5 border-r border-line bg-bg py-3">
            {providers.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  suppressHydrationWarning={true}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.name}
                  className={`flex h-8 w-8 items-center justify-center rounded-control text-xs font-bold transition ${isSelected ? '' : 'text-fg-3 hover:bg-bg-2 hover:text-fg'}`}
                  style={isSelected ? { background: `${tab.color}20`, color: tab.color, boxShadow: `0 0 0 1px ${tab.color}40` } : undefined}
                >
                  {tab.icon}
                </button>
              );
            })}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-shrink-0 border-b border-line px-3.5 pb-2 pt-3.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold" style={{ color: activeProvider.color }}>{activeProvider.icon}</span>
                <h4 className="text-xs font-semibold text-fg">{activeProvider.name}</h4>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-fg-3">{activeProvider.models.length} models</p>
            </div>

            <div className="max-h-[260px] space-y-0.5 overflow-y-auto p-2">
              {activeProvider.models.map((model) => {
                const isSelected = currentModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => { onSelectModel(model.id); setIsOpen(false); }}
                    className={`flex cursor-pointer items-center justify-between rounded-control px-3 py-2 text-xs transition ${isSelected ? 'font-semibold' : 'text-fg-2 hover:bg-bg-2 hover:text-fg'}`}
                    style={isSelected ? { background: `${activeProvider.color}1a`, color: activeProvider.color } : undefined}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{model.name}</span>
                      {model.tag && (
                        <span className="flex-shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold" style={{ background: `${activeProvider.color}22`, color: activeProvider.color }}>{model.tag}</span>
                      )}
                    </div>
                    {isSelected && <FiCheck className="ml-2 flex-shrink-0 text-sm" style={{ color: activeProvider.color }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
