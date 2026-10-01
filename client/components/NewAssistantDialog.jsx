'use client';

import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

export default function NewAssistantDialog({ isOpen, defaultModel, models, onClose, onCreate }) {
  const [name, setName] = useState('New Assistant');
  const [role, setRole] = useState('General Intelligence');
  const [model, setModel] = useState(defaultModel || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setName('New Assistant');
    setRole('General Intelligence');
    setModel(defaultModel || '');
    setBusy(false);
    setError('');
  }, [isOpen, defaultModel]);

  if (!isOpen) return null;

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Give the assistant a name.'); return; }
    setBusy(true);
    setError('');
    try {
      await onCreate({ name: trimmed, role: role.trim() || 'AI Assistant', model: model.trim() || defaultModel });
      onClose();
    } catch (failure) {
      setError(failure?.message || 'Could not create the assistant.');
    } finally {
      setBusy(false);
    }
  };

  const modelIds = [...new Set((models || []).map((m) => m.id).filter(Boolean))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="new-assistant-title">
      <form onSubmit={submit} className="surface w-full max-w-md space-y-4 p-5 shadow-pop animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 id="new-assistant-title" className="text-base font-semibold">New assistant</h2>
          <button type="button" onClick={onClose} className="btn-icon" title="Close"><FiX /></button>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="new-bot-name" className="label">Name</label>
          <input id="new-bot-name" value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus required maxLength={80} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="new-bot-role" className="label">Role</label>
          <input id="new-bot-role" value={role} onChange={(e) => setRole(e.target.value)} className="input" maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="new-bot-model" className="label">Model ID</label>
          <input id="new-bot-model" value={model} onChange={(e) => setModel(e.target.value)} list="new-bot-model-options" className="input font-mono" />
          <datalist id="new-bot-model-options">{modelIds.map((id) => <option key={id} value={id} />)}</datalist>
        </div>
        {error && <p role="alert" className="notice notice-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
}
