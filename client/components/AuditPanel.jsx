'use client';

import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiClock, FiRefreshCw, FiShield } from 'react-icons/fi';
import { fetchAuditEvents } from '../lib/api';

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function eventTone(event) {
  if (event.includes('failed') || event.includes('denied') || event.includes('expired')) return 'pill-danger';
  if (event.includes('completed') || event.includes('allow')) return 'pill-ok';
  return 'pill-info';
}

export default function AuditPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      setEvents(await fetchAuditEvents(200));
    } catch (err) {
      setError(err.message || 'Could not load audit events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const recentEvents = [...events].reverse();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bg text-fg">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <FiShield className="text-info" />
            <h2 className="text-sm font-semibold">Audit trail</h2>
          </div>
          <p className="mt-0.5 text-xs text-fg-3">Local record of approvals, workspace tools and connector actions.</p>
        </div>
        <button type="button" onClick={loadEvents} className="btn-icon" title="Refresh audit trail">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="notice notice-danger mx-6 mt-4 items-center"><FiAlertCircle /> {error}</div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {loading && events.length === 0 ? (
          <div className="py-16 text-center text-sm text-fg-3">Loading audit events…</div>
        ) : recentEvents.length === 0 ? (
          <div className="rounded-card border border-dashed border-line-2 py-16 text-center">
            <FiClock className="mx-auto text-2xl text-fg-3" />
            <p className="mt-3 text-sm text-fg-2">No audit events yet.</p>
            <p className="mt-1 text-xs text-fg-3">Approved workspace actions will appear here.</p>
          </div>
        ) : (
          <div className="surface overflow-hidden">
            {recentEvents.map((item, index) => {
              const event = item.event || item.type || 'event';
              return (
                <div
                  key={`${item.created_at || 'event'}-${item.request_id || item.connector || index}`}
                  className={`px-4 py-3.5 ${index > 0 ? 'border-t border-line' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`pill ${eventTone(event)}`}>{event}</span>
                        {item.tool && <span className="truncate font-mono text-xs text-fg-2">{item.tool}</span>}
                        {item.connector && <span className="truncate font-mono text-xs text-fg-2">{item.connector}</span>}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-fg-3">
                        {item.request_id && <span>request: {item.request_id}</span>}
                        {item.thread_id && <span>thread: {item.thread_id}</span>}
                        {typeof item.removed === 'number' && <span>removed: {item.removed}</span>}
                      </div>
                    </div>
                    <time className="flex-shrink-0 font-mono text-[10px] text-fg-3">{formatTimestamp(item.created_at)}</time>
                  </div>
                  {item.error && <p className="mt-2 text-xs text-danger">{item.error}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
