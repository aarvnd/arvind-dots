'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiArrowLeft,
  FiCpu,
  FiHardDrive,
  FiMonitor,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiSquare,
  FiTerminal,
} from 'react-icons/fi';

import {
  fetchComputerScreenshot,
  fetchComputerStatus,
  pauseComputer,
  resetComputer,
  startComputer,
  stopComputer,
} from '../lib/api';

const ACTIVE_STATES = new Set(['running', 'paused']);

function stateClasses(state) {
  if (state === 'running') return 'pill-ok';
  if (state === 'paused') return 'pill-warn';
  if (state === 'starting' || state === 'resetting') return 'pill-info';
  return 'pill-neutral';
}
function prettyState(state) {
  return (state || 'stopped').replace(/_/g, ' ');
}

export default function ComputerPanel({ bot, onBackToChat }) {
  const [computer, setComputer] = useState(null);
  const [screen, setScreen] = useState(null);
  const [activeTab, setActiveTab] = useState('display');
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState('');
  const [error, setError] = useState('');

  const botId = bot?.id;
  const state = computer?.state || 'stopped';
  const isActive = ACTIVE_STATES.has(state);

  const refresh = useCallback(async (includeScreen = true) => {
    if (!botId) return;
    try {
      const statusPayload = await fetchComputerStatus(botId);
      const nextComputer = statusPayload.status;
      setComputer(nextComputer);
      if (includeScreen && ACTIVE_STATES.has(nextComputer.state)) {
        const screenPayload = await fetchComputerScreenshot(botId);
        setScreen(screenPayload.result || null);
      } else if (!ACTIVE_STATES.has(nextComputer.state)) {
        setScreen(null);
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Computer provider is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    let disposed = false;
    setComputer(null);
    setScreen(null);
    setError('');
    setLoading(true);

    async function load() {
      if (!botId || disposed) return;
      try {
        const statusPayload = await fetchComputerStatus(botId);
        if (disposed) return;
        setComputer(statusPayload.status);
        if (ACTIVE_STATES.has(statusPayload.status.state)) {
          const screenPayload = await fetchComputerScreenshot(botId);
          if (!disposed) setScreen(screenPayload.result || null);
        }
      } catch (err) {
        if (!disposed) setError(err.message || 'Computer provider is unavailable.');
      } finally {
        if (!disposed) setLoading(false);
      }
    }

    load();
    const interval = window.setInterval(() => {
      if (!disposed) refresh(true);
    }, 4000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [botId, refresh]);

  const runAction = async (name, operation) => {
    if (!botId) return;
    setLoadingAction(name);
    setError('');
    try {
      await operation(botId);
      await refresh(true);
    } catch (err) {
      setError(err.message || `Computer ${name} failed.`);
    } finally {
      setLoadingAction('');
    }
  };

  const capabilities = useMemo(() => computer?.capabilities || [], [computer]);

  if (!bot) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg p-6 text-sm text-fg-2">
        Select a bot to view its computer provider.
      </div>
    );
  }

  const actionBusy = Boolean(loadingAction);

  return (
    <div className="flex h-screen flex-1 flex-col space-y-4 overflow-hidden bg-bg p-6 text-fg">
      <div className="surface flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBackToChat} className="btn-icon border border-line" aria-label="Back to chat">
            <FiArrowLeft />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-control border border-line bg-bg-2 text-xl text-accent-2">
            <FiMonitor />
          </div>
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              Computer provider
              <span className={`pill ${stateClasses(state)} capitalize`}>
                <FiActivity className={state === 'running' ? 'animate-pulse' : ''} /> {prettyState(state)}
              </span>
            </h2>
            <p className="truncate text-xs text-fg-3">
              Lifecycle for <span className="font-medium text-fg-2">{bot.name || 'Agent'}</span> through the governed provider boundary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {state === 'running' ? (
            <button onClick={() => runAction('pause', pauseComputer)} disabled={actionBusy} className="btn btn-ghost text-warn">
              <FiPause /> {loadingAction === 'pause' ? 'Pausing…' : 'Pause'}
            </button>
          ) : (
            <button onClick={() => runAction('start', startComputer)} disabled={actionBusy || state === 'starting' || state === 'resetting'} className="btn btn-primary">
              <FiPlay /> {loadingAction === 'start' ? (state === 'paused' ? 'Resuming…' : 'Starting…') : (state === 'paused' ? 'Resume' : 'Start')}
            </button>
          )}
          <button onClick={() => runAction('reset', resetComputer)} disabled={actionBusy} className="btn btn-ghost">
            <FiRefreshCw className={loadingAction === 'reset' ? 'animate-spin' : ''} /> Reset
          </button>
          <button onClick={() => runAction('stop', stopComputer)} disabled={actionBusy || state === 'stopped'} className="btn btn-ghost">
            <FiSquare /> Stop
          </button>
        </div>
      </div>

      {error && (
        <div className="notice notice-danger items-center">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
        <div className="surface relative col-span-2 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-bg-2/60 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-fg-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-ok animate-pulse' : 'bg-fg-3'}`} />
              Screen state · {computer?.width || 1920}x{computer?.height || 1080} @ {computer?.fps || 30}FPS
            </div>
            <span className="font-mono text-[10px] text-fg-3">
              {computer?.computer_id || 'not-created'}
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 pt-3">
            {[
              ['display', 'Display'],
              ['activity', 'Activity'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-control px-3 py-1.5 text-xs font-medium transition ${activeTab === tab ? 'bg-bg-2 text-fg' : 'text-fg-3 hover:text-fg-2'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-bg p-4">
            {activeTab === 'display' ? (
              screen?.available ? (
                screen.data ? (
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-control border border-line bg-black">
                    <img
                      src={`data:image/${screen.format || 'jpeg'};base64,${screen.data}`}
                      alt={`Computer frame ${screen.frame_id || ''}`}
                      className="max-w-full max-h-full object-contain"
                    />
                    <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-fg-2">
                      {screen.frame_id}
                    </span>
                  </div>
                ) : (
                  <div className="surface-2 relative flex h-full w-full flex-col justify-between overflow-hidden p-4">
                    <div className="flex items-center justify-between border-b border-line pb-2 text-xs text-fg-2">
                      <span className="font-mono text-info">Provider frame metadata</span>
                      <span>{screen.frame_id}</span>
                    </div>
                    <div className="font-mono text-xs space-y-2 my-auto">
                      <p className="text-ok">✓ Computer is {screen.state}</p>
                      <p className="text-fg-2">Provider: {screen.provider}</p>
                      <p className="text-fg-2">Generation: {screen.generation}</p>
                      <p className="text-warn">{screen.message}</p>
                      <p className="text-fg-3 animate-pulse">Polling for the next frame…</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-line pt-2 text-[10px] text-fg-3">
                      <span>Actual pixels require the selected Docker or remote runtime.</span>
                      <span>{screen.width}x{screen.height}</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center rounded-control border border-dashed border-line-2 p-8 text-center">
                  <FiMonitor className="mb-4 text-4xl text-fg-3" />
                  <p className="text-sm font-medium text-fg-2">No screen frame available</p>
                  <p className="mt-2 max-w-sm text-xs text-fg-3">
                    Start the selected provider to receive screen metadata or a live frame.
                  </p>
                </div>
              )
            ) : (
              <div className="h-full w-full space-y-2 overflow-auto rounded-control border border-line bg-bg-1 p-5 font-mono text-xs">
                <p className="text-fg-3">[provider] {computer?.provider || 'unconfigured'} adapter</p>
                <p className="text-fg-2">[state] {prettyState(state)}</p>
                <p className="text-fg-2">[health] {computer?.health || 'unknown'}</p>
                <p className="text-fg-2">[operation] {computer?.last_operation || 'none'}</p>
                <p className="text-fg-3">[screen] {screen?.frame_id || 'no frame'}</p>
                <p className="text-info">[note] All lifecycle calls are recorded by the action gateway.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="surface space-y-3 p-4">
            <h3 className="label flex items-center gap-2">
              <FiCpu className="text-accent-2" /> Provider status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-fg-3"><span>Provider</span><span className="font-mono text-fg">{computer?.provider || 'unconfigured'}</span></div>
              <div className="flex justify-between text-fg-3"><span>State</span><span className="capitalize text-fg">{prettyState(state)}</span></div>
              <div className="flex justify-between text-fg-3"><span>Health</span><span className="capitalize text-fg">{computer?.health || 'unknown'}</span></div>
              <div className="flex justify-between text-fg-3"><span>Generation</span><span className="font-mono text-fg">{computer?.generation ?? 0}</span></div>
              <div className="flex justify-between text-fg-3"><span>Last operation</span><span className="font-mono text-fg">{computer?.last_operation || 'none'}</span></div>
            </div>
          </div>

          <div className="surface flex min-h-0 flex-1 flex-col space-y-3 p-4">
            <h3 className="label flex items-center gap-2">
              <FiTerminal className="text-accent-2" /> Contract capabilities
            </h3>
            {loading ? (
              <p className="text-xs text-fg-3">Loading provider…</p>
            ) : (
              <div className="flex-1 space-y-2 overflow-y-auto rounded-control border border-line bg-bg p-3">
                {capabilities.map((capability) => (
                  <div key={capability} className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-fg-2">{capability}</span>
                    <span className="text-ok">declared</span>
                  </div>
                ))}
                {!capabilities.length && <p className="text-[11px] text-fg-3">No provider has been created yet.</p>}
              </div>
            )}
            <div className="flex items-center gap-2 text-[10px] text-fg-3">
              <FiHardDrive /> Runtime state is local and ephemeral in this milestone.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
