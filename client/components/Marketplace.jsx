'use client';

import React, { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCheck,
  FiExternalLink,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiZap,
} from 'react-icons/fi';
import {
  authorizeConnector,
  disconnectConnector,
  fetchConnectionStatus,
  fetchConnectorCatalog,
} from '../lib/api';

// A stable fallback keeps the marketplace useful when the API or connector key
// is not configured yet.
const CURATED_APPS = [
  { slug: 'github', label: 'GitHub', blurb: 'Issues, pull requests, and code', domain: 'github.com' },
  { slug: 'slack', label: 'Slack', blurb: 'Post updates and read channels', domain: 'slack.com' },
  { slug: 'gmail', label: 'Gmail', blurb: 'Read and send email', domain: 'gmail.com' },
  { slug: 'googlecalendar', label: 'Google Calendar', blurb: 'Read and create calendar events', domain: 'calendar.google.com' },
  { slug: 'googlesheets', label: 'Google Sheets', blurb: 'Read and update spreadsheets', domain: 'sheets.google.com' },
  { slug: 'googledocs', label: 'Google Docs', blurb: 'Read and write documents', domain: 'docs.google.com' },
  { slug: 'googledrive', label: 'Google Drive', blurb: 'Browse and manage files', domain: 'drive.google.com' },
  { slug: 'notion', label: 'Notion', blurb: 'Pages and databases', domain: 'notion.so' },
  { slug: 'linear', label: 'Linear', blurb: 'Issues and project tracking', domain: 'linear.app' },
  { slug: 'discord', label: 'Discord', blurb: 'Messages and channels', domain: 'discord.com' },
  { slug: 'x', label: 'X (Twitter)', blurb: 'Post and read on X', domain: 'x.com' },
  { slug: 'hubspot', label: 'HubSpot', blurb: 'CRM search and updates', domain: 'hubspot.com' },
  { slug: 'salesforce', label: 'Salesforce', blurb: 'CRM records and reports', domain: 'salesforce.com' },
  { slug: 'jira', label: 'Jira', blurb: 'Issues and sprints', domain: 'atlassian.com' },
  { slug: 'asana', label: 'Asana', blurb: 'Tasks and projects', domain: 'asana.com' },
  { slug: 'trello', label: 'Trello', blurb: 'Boards and cards', domain: 'trello.com' },
  { slug: 'dropbox', label: 'Dropbox', blurb: 'Files and folders', domain: 'dropbox.com' },
  { slug: 'airtable', label: 'Airtable', blurb: 'Bases and records', domain: 'airtable.com' },
  { slug: 'figma', label: 'Figma', blurb: 'Files and comments', domain: 'figma.com' },
  { slug: 'stripe', label: 'Stripe', blurb: 'Payments and customers', domain: 'stripe.com' },
  { slug: 'zapier', label: 'Zapier', blurb: 'Connect apps through automation', domain: 'zapier.com' },
  { slug: 'reddit', label: 'Reddit', blurb: 'Browse and post on Reddit', domain: 'reddit.com' },
  { slug: 'sentry', label: 'Sentry', blurb: 'Errors, alerts, and performance', domain: 'sentry.io' },
  { slug: 'posthog', label: 'PostHog', blurb: 'Analytics and feature flags', domain: 'posthog.com' },
];

const LS_KEY = 'arvind_dots_connected_plugins';

function loadLocalEnabled() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalEnabled(slugs) {
  localStorage.setItem(LS_KEY, JSON.stringify(slugs));
}

function normalizeCard(app) {
  return {
    slug: app.slug || app.key || app.name,
    label: app.label || app.name || app.slug,
    blurb: app.blurb || app.description || 'Connector integration',
    domain: app.domain || '',
    logo: app.logo || null,
  };
}

function AppIcon({ app }) {
  const [failed, setFailed] = useState(false);
  const source = app.logo || (app.domain
    ? `https://www.google.com/s2/favicons?domain=${app.domain}&sz=64`
    : null);

  if (source && !failed) {
    return (
      <img
        src={source}
        alt=""
        className="w-8 h-8 rounded-lg object-contain flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-control border border-line bg-bg-2 text-xs font-bold text-fg-2">
      {(app.label || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function Marketplace({ onOpenSettings }) {
  const [apps, setApps] = useState(CURATED_APPS);
  const [connected, setConnected] = useState([]);
  const [search, setSearch] = useState('');
  const [configured, setConfigured] = useState(false);
  const [source, setSource] = useState('curated');
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadMarketplace() {
      setLoading(true);
      setError('');

      const catalog = await fetchConnectorCatalog();
      const nextApps = (catalog.cards || []).length
        ? catalog.cards.map(normalizeCard)
        : CURATED_APPS;

      if (!mounted) return;
      setApps(nextApps);
      setConfigured(Boolean(catalog.configured));
      setSource(catalog.source || 'curated');

      if (catalog.configured && nextApps.length) {
        const status = await fetchConnectionStatus(nextApps.map((app) => app.slug));
        if (!mounted) return;
        setConnected(
          Object.entries(status.services || {})
            .filter(([, value]) => value && value.connected)
            .map(([slug]) => slug),
        );
        if (status.error) setError(status.error);
      } else {
        setConnected(loadLocalEnabled());
      }

      if (mounted) setLoading(false);
    }

    loadMarketplace().catch((err) => {
      if (!mounted) return;
      setError(err.message || 'Could not load connector catalog');
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [refreshToken]);

  const toggle = async (app) => {
    if (busySlug) return;
    setNotice('');
    setError('');

    const isOn = connected.includes(app.slug);
    if (!configured) {
      const next = isOn
        ? connected.filter((slug) => slug !== app.slug)
        : [...connected, app.slug];
      setConnected(next);
      saveLocalEnabled(next);
      setNotice('Local preference saved. Add a Composio key to authorize a real account.');
      return;
    }

    setBusySlug(app.slug);
    let authWindow = null;
    try {
      if (!isOn && typeof window !== 'undefined') {
        authWindow = window.open('', '_blank');
      }

      if (isOn) {
        await disconnectConnector(app.slug);
        setConnected((current) => current.filter((slug) => slug !== app.slug));
        setNotice(`${app.label} disconnected.`);
      } else {
        const result = await authorizeConnector(app.slug);
        if (!result.url) throw new Error('The connector did not return an authorization link');
        if (authWindow) {
          authWindow.location.href = result.url;
        } else if (typeof window !== 'undefined') {
          window.open(result.url, '_blank', 'noopener,noreferrer');
        }
        setNotice(`Authorization opened for ${app.label}. Refresh after completing it.`);
      }
    } catch (err) {
      if (authWindow && !authWindow.closed) authWindow.close();
      setError(err.message || `Could not update ${app.label}`);
    } finally {
      setBusySlug(null);
    }
  };

  const visible = apps.filter((app) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return `${app.label} ${app.slug} ${app.blurb}`.toLowerCase().includes(query);
  });

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden bg-bg text-fg">
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Connected apps</h2>
            <span className="pill pill-neutral">
              {connected.length} connected
            </span>
          </div>
          <p className="mt-0.5 text-xs text-fg-3">
            {source === 'api' ? 'Live connector catalog' : 'Curated connector catalog'}
            {configured ? ' · account authorization available' : ' · local preview mode'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshToken((value) => value + 1)}
            className="btn-icon"
            title="Refresh connector status"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative w-56">
            <FiSearch className="absolute left-3 top-3 text-xs text-fg-3" />
            <input
              suppressHydrationWarning={true}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps…"
              className="input pl-8 py-2"
            />
          </div>
        </div>
      </div>

      <div className="mx-6 mt-4 flex-shrink-0">
        <div className="notice notice-info">
          <FiZap className="mt-0.5 flex-shrink-0" />
          <span>
            {configured
              ? 'Connect an app to open its provider authorization flow. No account is connected until you complete that flow.'
              : 'This is a local catalog preview. Add a Composio API key in App Settings to discover live connectors and authorize accounts.'}
          </span>
          {!configured && onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="ml-auto flex flex-shrink-0 items-center gap-1 font-semibold text-info hover:text-fg"
            >
              <FiSettings /> Settings
            </button>
          )}
        </div>
      </div>

      {(notice || error) && (
        <div className={`notice mx-6 mt-3 flex-shrink-0 ${error ? 'notice-danger' : 'notice-ok'}`}>
          {error ? <FiAlertCircle className="mt-0.5 flex-shrink-0" /> : <FiCheck className="mt-0.5 flex-shrink-0" />}
          <span>{error || notice}</span>
        </div>
      )}

      <div
        className="surface mx-6 mb-6 mt-3 flex-1 overflow-y-auto"
      >
        {loading && apps.length === 0 ? (
          <div className="py-16 text-center text-sm text-fg-3">Loading connectors…</div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-sm text-fg-3">No apps match.</div>
        ) : (
          visible.map((app, index) => {
            const isOn = connected.includes(app.slug);
            const isBusy = busySlug === app.slug;
            return (
              <div
                key={app.slug}
                className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-bg-2/60 ${index > 0 ? 'border-t border-line' : ''}`}
              >
                <AppIcon app={app} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-fg">
                    {app.label}
                    {isOn && <span className="block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ok" />}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-fg-3">{app.blurb}</div>
                </div>

                <button
                  suppressHydrationWarning={true}
                  type="button"
                  disabled={Boolean(busySlug)}
                  onClick={() => toggle(app)}
                  className={`btn btn-ghost w-28 flex-shrink-0 py-1.5 text-xs ${isOn ? 'text-ok hover:text-danger' : ''}`}
                >
                  {isBusy ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : isOn ? (
                    <>
                      <FiCheck className="text-xs" />
                      {configured ? 'Connected' : 'Enabled'}
                    </>
                  ) : (
                    <>
                      {configured && <FiExternalLink className="text-xs" />}
                      {configured ? 'Connect' : 'Enable'}
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
