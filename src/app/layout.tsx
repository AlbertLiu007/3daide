import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3daide | Free 3D Tools for Engineers & Creators',
  description: 'Convert, analyze, quote, and review 3D models with AI-assisted DFM guidance.',
  icons: {
    icon: '/favicon.svg',
  },
};

const themeScript = `
  (() => {
    try {
      const stored = localStorage.getItem('3daide.theme') || 'system';
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const theme = stored === 'system' ? (prefersLight ? 'light' : 'dark') : stored;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.themePreference = stored;
    } catch {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.dataset.themePreference = 'system';
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="92ebd77a-6ae6-42fd-8e7d-93368a04a516" />
      </head>
      <body>{children}</body>
    </html>
  );
}
