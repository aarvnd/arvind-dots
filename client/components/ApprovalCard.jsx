'use client';

import React, { useState } from 'react';
import { FiShield, FiTerminal, FiCheck, FiX } from 'react-icons/fi';

export default function ApprovalCard({ approval, onRespond }) {
  const [status, setStatus] = useState('pending'); // pending, allowed, denied
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (onRespond) {
        await onRespond(approval.requestId, action);
      }
      setStatus(action === 'allow' ? 'allowed' : 'denied');
    } catch (err) {
      setError(err?.message || 'Could not submit this decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="surface my-3 max-w-xl border-warn/40 p-4 animate-fade-in">
      <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
        <div className="flex items-center gap-2 text-warn">
          <FiShield className="text-base" />
          <span className="label text-warn">Approval needed</span>
        </div>
        <span className="pill pill-warn">{approval.tool || 'terminal.execute'}</span>
      </div>

      <div className="my-2 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-control border border-line bg-bg-2 text-warn">
          <FiTerminal className="text-base" />
        </div>
        <div>
          <p className="text-sm font-medium text-fg">{approval.summary}</p>
          <p className="mt-0.5 text-xs text-fg-2">The assistant wants to run this action on your environment.</p>
        </div>
      </div>

      {status === 'pending' ? (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
          {error && <span className="mr-auto text-xs text-danger">{error}</span>}
          <button disabled={isSubmitting} onClick={() => handleAction('deny')} className="btn btn-ghost text-danger">
            <FiX className="text-sm" /><span>Deny</span>
          </button>
          <button disabled={isSubmitting} onClick={() => handleAction('allow')} className="btn btn-primary">
            <FiCheck className="text-sm" /><span>Allow</span>
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
          <span className="text-fg-3">Status</span>
          <span className={`pill ${status === 'allowed' ? 'pill-ok' : 'pill-danger'}`}>
            {status === 'allowed' ? <FiCheck /> : <FiX />}
            {status === 'allowed' ? 'Approved' : 'Denied'}
          </span>
        </div>
      )}
    </div>
  );
}
