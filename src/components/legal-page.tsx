import Link from 'next/link';
import { lastUpdated } from '@/lib/legal/content';

type LegalDocument = {
  title: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] px-4 py-8 text-[var(--text-strong)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-[var(--border-muted)] pb-5">
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              className="h-6 w-6 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className="text-xl tracking-tight" aria-label="3daide">
              <span className="font-bold text-[var(--text-strong)]">3d</span>
              <span className="font-light text-[var(--text-muted)]">aide</span>
            </span>
          </Link>
          <Link href="/" className="interactive-hover rounded-md border border-[var(--border-muted)] bg-[var(--panel-bg)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)]">
            Back to app
          </Link>
        </header>

        <article className="rounded-xl border border-[var(--border-muted)] bg-[var(--panel-bg)] p-6 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)] sm:p-8">
          <h1 className="text-3xl font-semibold text-[var(--text-strong)]">{document.title}</h1>
          <p className="mt-3 text-sm text-[var(--text-muted)]">Last updated: {lastUpdated}</p>
          <div className="mt-8 grid gap-10">
            {document.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-[var(--text-strong)]">{section.title}</h2>
                <p className="mt-3 text-sm leading-[1.6] text-[var(--text-secondary)]">{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
