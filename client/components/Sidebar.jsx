'use client';

import React, { useState } from 'react';
import { FiSearch, FiPlus, FiSettings, FiActivity, FiLogOut, FiGrid } from 'react-icons/fi';
import MascotAvatar from './MascotAvatar';
import Logo from './Logo';

export default function Sidebar({
  onLogout,
  bots,
  activeBotId,
  userName,
  onSelectBot,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenNewBot
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isIssueDismissed, setIsIssueDismissed] = useState(false);
  // userName comes from Dashboard (synced with AppSettingsDrawer in real-time)
  const displayName = userName || 'You';


  const displayBots = (bots || []).map((b, idx) => ({
    id: b.id,
    name: b.name,
    subtitle: b.role || b.description || 'General Intelligence',
    avatarType: b.isError ? 'warning' : idx % 2 === 1 ? 'pink' : 'blue',
    time: b.created_at ? new Date(b.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : (b.time || ''),
    isError: !!b.isError,
    originalBot: b
  }));

  const errorCount = displayBots.filter((b) => b.isError).length;

  const filteredBots = displayBots.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="flex h-screen w-72 flex-shrink-0 flex-col justify-between border-r border-line bg-bg-1 text-fg-2">
      <div className="space-y-3 p-3.5">
        <div className="flex items-center justify-between px-1 pt-1">
          <Logo href="/" size={20} />
          <button suppressHydrationWarning={true} onClick={onOpenNewBot} title="Create New Bot" className="btn-icon">
            <FiPlus className="text-lg" />
          </button>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-xs text-fg-3" />
          <input suppressHydrationWarning={true} type="text" placeholder="Search assistants" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-8 py-2" />
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2">
        <p className="label px-2 pb-1 pt-1">Assistants</p>
        {filteredBots.length === 0 && (
          <div className="mx-1 rounded-card border border-dashed border-line-2 p-4 text-center">
            <p className="text-xs text-fg-2">{displayBots.length === 0 ? 'No assistants yet.' : 'No matches.'}</p>
            {displayBots.length === 0 && <button suppressHydrationWarning={true} onClick={onOpenNewBot} className="btn btn-ghost mt-3 w-full">Create one</button>}
          </div>
        )}
        {filteredBots.map((botItem) => {
          const isActive = activeBotId === botItem.id || (activeBotId === '' && botItem.id === displayBots[0]?.id);
          return (
            <div
              key={botItem.id}
              onClick={() => onSelectBot(botItem.id)}
              className={`group relative flex cursor-pointer items-start gap-3 rounded-control border p-2.5 transition-colors ${isActive ? 'border-line-2 bg-bg-2 text-fg' : 'border-transparent hover:bg-bg-2/60'}`}
            >
              {isActive && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-accent" aria-hidden="true" />}
              <MascotAvatar type={botItem.avatarType} size="md" />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-sm font-medium text-fg">{botItem.name}</h3>
                  {botItem.time && <span className="ml-1 font-mono text-[10px] text-fg-3">{botItem.time}</span>}
                </div>
                <p className="mt-0.5 truncate text-xs text-fg-3 group-hover:text-fg-2">{botItem.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-1 border-t border-line p-3">
        <button suppressHydrationWarning={true} onClick={() => onSelectTab && onSelectTab('marketplace')} className={`flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-sm transition ${activeTab === 'marketplace' ? 'bg-bg-2 text-fg' : 'hover:bg-bg-2 hover:text-fg'}`}>
          <FiGrid className="text-sm text-accent-2" /><span>Connected apps</span>
        </button>
        <button suppressHydrationWarning={true} onClick={() => onSelectTab && onSelectTab('audit')} className={`flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-sm transition ${activeTab === 'audit' ? 'bg-bg-2 text-fg' : 'hover:bg-bg-2 hover:text-fg'}`}>
          <FiActivity className="text-sm text-info" /><span>Audit trail</span>
        </button>
        <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-sm transition hover:bg-bg-2 hover:text-fg">
          <FiLogOut className="text-sm" /> Sign out
        </button>

        <div className="flex items-center justify-between pt-1">
          {errorCount > 0 && !isIssueDismissed ? (
            <div className="flex items-center gap-2">
              <div className="pill pill-danger cursor-pointer" title={`${errorCount} agent process spawn issue detected`}>
                <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
                <span>{errorCount} Issue{errorCount > 1 ? 's' : ''}</span>
                <button suppressHydrationWarning={true} onClick={(e) => { e.stopPropagation(); setIsIssueDismissed(true); }} className="ml-0.5 font-bold" title="Dismiss issue notification">✕</button>
              </div>
            </div>
          ) : (
            <button suppressHydrationWarning={true} onClick={onOpenSettings} className="flex items-center gap-2 rounded-control px-2 py-1 text-sm transition hover:bg-bg-2 hover:text-fg">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-bg-2 text-[11px] font-semibold text-fg-2">{displayName.charAt(0).toUpperCase()}</div>
              <span>{displayName}</span>
            </button>
          )}
          <button suppressHydrationWarning={true} onClick={onOpenSettings} className="btn-icon" title="Settings">
            <FiSettings className="text-sm" />
          </button>
        </div>
      </div>
    </aside>
  );
}
