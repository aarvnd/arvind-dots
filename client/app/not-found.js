import Link from 'next/link';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center text-fg">
      <Logo />
      <p className="font-mono text-5xl font-semibold text-accent-2">404</p>
      <p className="text-sm text-fg-2">That page does not exist.</p>
      <Link href="/" className="btn btn-ghost">Back to home</Link>
    </main>
  );
}
