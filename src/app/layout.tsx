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
      <body>{children}</body>
    </html>
  );
}
