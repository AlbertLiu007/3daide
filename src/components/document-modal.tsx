'use client';

import { Check, X } from 'lucide-react';

export type DocumentSection = {
  title: string;
  body: string;
};

export type DocumentModalContent = {
  title: string;
  intro: string;
  sections: DocumentSection[];
};

export function DocumentModal({ content, onClose }: { content: DocumentModalContent | null; onClose: () => void }) {
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="document-modal-title">
      <div className="relative max-h-[86vh] w-full max-w-[600px] overflow-y-auto rounded-xl border border-[var(--border-muted)] bg-[var(--panel-bg)] p-6 text-left shadow-[0_25px_50px_-12px_rgba(15,23,42,0.22)] sm:p-7">
        <button type="button" onClick={onClose} aria-label="Close dialog" className="interactive-hover absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-[var(--text-subtle)]">
          <X className="h-5 w-5" />
        </button>
        <h3 id="document-modal-title" className="pr-10 text-2xl font-semibold text-[var(--text-strong)]">
          {content.title}
        </h3>
        <p className="mt-4 text-sm leading-[1.6] text-[var(--text-secondary)]">{content.intro}</p>
        <div className="mt-6 grid gap-5">
          {content.sections.map((section) => (
            <section key={section.title} className="grid gap-2">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h4 className="font-semibold text-[var(--text-strong)]">{section.title}</h4>
                  <p className="mt-2 text-sm leading-[1.6] text-[var(--text-secondary)]">{section.body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
