import Link from 'next/link';

export function LogoMark({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="7" cy="7" r="3.5" fill="#f4f4f6" />
      <circle cx="17" cy="7" r="3.5" fill="#8b5cf6" />
      <circle cx="7" cy="17" r="3.5" fill="#f4f4f6" opacity="0.55" />
      <circle cx="17" cy="17" r="3.5" fill="#f4f4f6" />
    </svg>
  );
}

export default function Logo({ href = '/', size = 22, wordmark = true, className = '' }) {
  const body = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {wordmark && <span className="text-sm font-semibold tracking-tight text-fg">Arvind Dots</span>}
    </span>
  );
  if (!href) return body;
  return <Link href={href} aria-label="Arvind Dots home">{body}</Link>;
}
