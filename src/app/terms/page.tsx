import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { terms } from '@/lib/legal/content';

export const metadata: Metadata = {
  title: 'Terms of Service | 3daide',
};

export default function TermsPage() {
  return <LegalPage document={terms} />;
}
