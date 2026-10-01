import Link from 'next/link';
import Logo, { LogoMark } from '../components/Logo';

const GITHUB = 'https://github.com/aarvnd/arvind-dots';

const features = [
  {
    title: 'Local-first by design',
    body: 'Conversations, assistants and settings live in SQLite on the machine you run it on. Provider keys are encrypted at rest.',
  },
  {
    title: 'Approval-gated actions',
    body: 'Workspace and computer operations go through a deny-by-default gateway. Higher-risk actions pause for your approval and leave an audit trail.',
  },
  {
    title: 'Bring your own model',
    body: 'Point it at any Responses-compatible endpoint, list the model IDs you want, and switch models per assistant from the chat header.',
  },
];

const steps = [
  ['01', 'Sign in', 'Use the owner token the server generated on first start. No accounts, no sign-up.'],
  ['02', 'Add a model', 'Open Settings, paste your API base URL and key, and save the model IDs you want to use.'],
  ['03', 'Create an assistant', 'Give it a name, a role and a model. Then chat, attach images, and let it ask before it acts.'],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <a href={GITHUB} className="btn btn-ghost" target="_blank" rel="noreferrer">GitHub</a>
          <Link href="/app" className="btn btn-primary">Open the app</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-24">
        <p className="label mb-5">self-hosted · open source · MIT</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          A personal AI agent workspace that asks before it acts.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-fg-2">
          Arvind Dots is a small, inspectable workspace for chatting with assistants, connecting apps, and
          running computer tasks, with every risky step routed through an approval prompt. Run it on your own box.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/app" className="btn btn-primary px-5 py-3 text-sm">Open the app</Link>
          <a href={GITHUB} className="btn btn-ghost px-5 py-3 text-sm" target="_blank" rel="noreferrer">View source</a>
        </div>
      </section>

      <section className="border-y border-line bg-bg-1/60">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="surface surface-hover p-5">
              <LogoMark size={18} className="mb-4 opacity-80" />
              <h2 className="text-base font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-6 text-fg-2">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="label mb-3">how it works</p>
        <h2 className="text-2xl font-semibold tracking-tight">Three steps to a working assistant</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(([n, title, body]) => (
            <li key={n} className="surface p-5">
              <span className="font-mono text-xs text-accent-2">{n}</span>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-fg-2">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-bg-1/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">What it is, and what it is not</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="surface p-5 text-sm leading-6 text-fg-2">
              <p className="font-medium text-fg">It is</p>
              <p className="mt-2">A single-owner workspace with streaming chat, image attachments, a connector marketplace, an optional Docker computer runtime, and an audit log of every gated action.</p>
            </div>
            <div className="surface p-5 text-sm leading-6 text-fg-2">
              <p className="font-medium text-fg">It is not</p>
              <p className="mt-2">A multi-user product, a hardened sandbox for hostile websites, or a managed cloud service. It is a personal tool you run and inspect yourself.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-fg-3 sm:px-6">
        <span>Arvind Dots · MIT · built by <a className="text-fg-2 hover:text-fg" href="https://arvind.codes">Arvind Kumar</a></span>
        <a className="text-fg-2 hover:text-fg" href={GITHUB} target="_blank" rel="noreferrer">Source on GitHub</a>
      </footer>
    </main>
  );
}
