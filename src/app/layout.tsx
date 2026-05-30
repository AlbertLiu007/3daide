import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3daide | Free 3D Tools for Engineers & Creators',
  description: 'Convert, analyze, quote, and review 3D models with AI-assisted DFM guidance.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="92ebd77a-6ae6-42fd-8e7d-93368a04a516" />
      </head>
      <body>{children}</body>
    </html>
  );
}
