import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata = {
  metadataBase: new URL('https://dots.arvind.codes'),
  title: 'Arvind Dots',
  description: 'A self-hosted personal AI agent workspace by Arvind Kumar.',
  openGraph: {
    title: 'Arvind Dots',
    description: 'Self-hosted AI chat, connectors, computer tasks and approval-gated actions.',
    type: 'website',
    url: 'https://dots.arvind.codes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning={true}>
      <body className="bg-bg text-fg antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
