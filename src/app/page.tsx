'use client';

import {
  Bot,
  CheckCircle2,
  ChevronDown,
  Download,
  FileUp,
  Github,
  Languages,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { DocumentModal, type DocumentModalContent } from '@/components/document-modal';
import type * as THREE from 'three';
import { ThreeModelViewer } from '@/components/model-viewer/three-model-viewer';
import { convertModel } from '@/lib/converter/convert-model';
import { useLocale } from '@/lib/i18n/use-locale';
import { dictionaries, locales, type Locale } from '@/lib/i18n/dictionaries';
import { howItWorks, privacySecurity } from '@/lib/legal/content';
import { measureModel } from '@/lib/model/model-measure';
import { disposeObjectResources } from '@/lib/model/model-scene';
import { getModelFormat, meshModelFormats, type MeshModelFormat, type ModelFormat, type ModelMeasurement } from '@/lib/model/model-types';
import { parseModelBuffer } from '@/lib/model/parse-model';
import { calculateQuote } from '@/lib/pricing/calculate-quote';
import { defaultMaterials } from '@/lib/pricing/material-defaults';
import type { QuoteResult } from '@/lib/pricing/pricing-types';

type ToolTab = 'convert' | 'quote' | 'dfm';

const maxFileSizeBytes = 300 * 1024 * 1024;

function formatNumber(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '--';
  return value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '--';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function readFile(file: File) {
  return file.arrayBuffer();
}

function InfoPill({ icon: Icon, children }: { icon: typeof ShieldCheck; children: React.ReactNode }) {
  return (
    <div className="inline-flex min-h-11 items-center gap-3 rounded-md border border-[#27272a] bg-[#1f1f23] px-4 py-3 text-xs font-semibold leading-5 text-zinc-300">
      <Icon className="h-4 w-4 shrink-0 text-[#34d399]" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-20 rounded-md border border-[#27272a] bg-[#1f1f23] p-3">
      <div className="text-[11px] font-semibold uppercase text-zinc-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-zinc-50">{value}</div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
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
        <span className="font-bold text-white">3d</span>
        <span className="font-light text-zinc-400">aide</span>
      </span>
    </div>
  );
}

export default function HomePage() {
  const { locale, setLocale, t } = useLocale();
  const dir = t.dir;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<ToolTab>('convert');
  const [modelObject, setModelObject] = useState<THREE.Object3D | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; format: ModelFormat } | null>(null);
  const [measurement, setMeasurement] = useState<ModelMeasurement | null>(null);
  const [status, setStatus] = useState(t.status.idle);
  const [error, setError] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<MeshModelFormat>('glb');
  const [conversion, setConversion] = useState<{ url: string; fileName: string } | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(defaultMaterials[0].id);
  const [quantity, setQuantity] = useState(1);
  const [betaEmail, setBetaEmail] = useState('');
  const [betaBusy, setBetaBusy] = useState(false);
  const [betaMessage, setBetaMessage] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<DocumentModalContent | null>(null);

  const selectedMaterial = defaultMaterials.find((material) => material.id === selectedMaterialId) ?? defaultMaterials[0];
  const quote = useMemo<QuoteResult | null>(() => {
    if (!measurement) return null;
    return calculateQuote({ measurement, material: selectedMaterial, quantity });
  }, [measurement, quantity, selectedMaterial]);

  async function handleFile(file: File) {
    setError(null);
    setConversion(null);
    if (file.size > maxFileSizeBytes) {
      setError(`File is too large. Max ${formatFileSize(maxFileSizeBytes)}.`);
      return;
    }

    try {
      setStatus(t.status.reading);
      const format = getModelFormat(file.name);
      const buffer = await readFile(file);
      setStatus(t.status.parsing);
      await waitForPaint();
      const object = await parseModelBuffer(buffer, format);
      setStatus(t.status.measuring);
      await waitForPaint();
      const measured = measureModel(object);

      if (modelObject) disposeObjectResources(modelObject);
      setModelObject(object);
      setFileMeta({ name: file.name, size: file.size, format });
      setMeasurement(measured);
      setStatus(t.upload.ready);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Model processing failed.');
      setStatus(t.status.failed);
    }
  }

  async function runConversion() {
    if (!modelObject || !fileMeta) return;
    setError(null);
    setStatus(t.status.converting);
    try {
      if (conversion) URL.revokeObjectURL(conversion.url);
      const result = await convertModel({
        fileName: fileMeta.name,
        sourceFormat: fileMeta.format,
        targetFormat,
        object: modelObject,
      });
      setConversion({ url: URL.createObjectURL(result.blob), fileName: result.fileName });
      setStatus(t.convert.converted);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Conversion failed.');
      setStatus(t.status.failed);
    }
  }

  async function joinBeta() {
    const email = betaEmail.trim();
    if (!email || betaBusy) return;
    setBetaBusy(true);
    setBetaMessage(null);
    try {
      const response = await fetch('/api/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'ai-dfm-expert' }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error ?? 'Unable to join beta.');
      setBetaEmail('');
      setBetaMessage('You are on the private beta list. We will reach out when early access opens.');
    } catch {
      setBetaMessage('Please enter a valid email address and try again.');
    } finally {
      setBetaBusy(false);
    }
  }

  const tabs: Array<{ id: ToolTab; label: string; icon: typeof UploadCloud }> = [
    { id: 'convert', label: t.tabs.convert, icon: UploadCloud },
    { id: 'quote', label: t.tabs.quote, icon: Sparkles },
    { id: 'dfm', label: t.tabs.dfm, icon: Bot },
  ];

  return (
    <main dir={dir} className="min-h-screen bg-[#09090b] text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-400 md:flex">
            <button type="button" className="hover:text-zinc-50" onClick={() => setModalContent(howItWorks)}>
              {t.nav.how}
            </button>
            <button type="button" className="hover:text-zinc-50" onClick={() => setModalContent(privacySecurity)}>
              {t.nav.privacy}
            </button>
            <a className="inline-flex items-center gap-1 hover:text-zinc-50" href="https://github.com/" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              {t.nav.github}
            </a>
          </nav>
          <label className="relative flex items-center gap-2 rounded-md border border-[#27272a] bg-[#18181b] px-2 py-1 text-xs text-zinc-300">
            <Languages className="h-4 w-4 text-[#3b82f6]" />
            <select
              value={locale}
              onChange={(event) => {
                const nextLocale = event.target.value as Locale;
                setLocale(nextLocale);
              }}
              className="bg-transparent pr-6 text-xs font-semibold outline-none"
            >
              {locales.map((item) => (
                <option key={item} value={item} className="bg-zinc-950 text-zinc-100">
                  {dictionaries[item].localeName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <div className="mb-6 max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-normal text-zinc-50 sm:text-5xl">{t.hero.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-400">{t.hero.subtitle}</p>
          </div>

          <div className="overflow-hidden rounded-md border border-[#27272a] bg-[#18181b]">
            <div className="flex border-b border-[#27272a] bg-[#18181b] px-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex h-12 flex-1 items-center justify-center gap-2 border-b-2 text-sm font-semibold transition ${
                      activeTab === tab.id ? 'border-[#3b82f6] bg-[#27272a]/45 text-white' : 'border-transparent text-zinc-500 hover:bg-[#27272a]/35 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'dfm' ? (
              <div className="flex min-h-[420px] items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.11),transparent_38%),#0b0b0d] px-5 py-6">
                <div className="w-full max-w-[500px] rounded-md border border-[#27272a] bg-[#1f1f23] p-5 shadow-[0_20px_45px_-24px_rgba(59,130,246,0.55)]">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-[#3b82f6]/35 bg-[#3b82f6]/10 text-[#3b82f6]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h2 className="text-[22px] font-semibold leading-tight text-white">AI DFM Expert is Coming Soon</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    We are fine-tuning our AI engine to analyze your 3D models for printability, wall-thickness risks, and warping issues.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-zinc-100">Want early access? Join our private beta list:</p>
                  <div className="mt-3 grid gap-3">
                    <label className="grid gap-2 text-sm text-zinc-400">
                      Email address
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                        <input
                          type="email"
                          value={betaEmail}
                          onChange={(event) => setBetaEmail(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') void joinBeta();
                          }}
                          placeholder="you@company.com"
                          className="h-10 w-full rounded-md border border-[#27272a] bg-[#18181b] pl-10 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-[#3b82f6]"
                        />
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => void joinBeta()}
                      disabled={betaBusy}
                      className="flex h-10 items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-[#09090b] transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-[#27272a] disabled:text-zinc-500"
                    >
                      {betaBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Join Beta
                    </button>
                    {betaMessage ? <p className="text-sm leading-6 text-zinc-300">{betaMessage}</p> : null}
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div
                className="relative min-h-[460px] border-b border-[#27272a] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.11),transparent_38%),#0b0b0d] lg:border-b-0 lg:border-r"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files.item(0);
                  if (file) void handleFile(file);
                }}
              >
                {modelObject ? (
                  <ThreeModelViewer object={modelObject} color="#9ed3ff" labels={t.viewer} />
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-5 flex flex-col items-center justify-center rounded-md border border-dashed border-[#27272a] bg-[#09090b]/45 text-center transition hover:border-[#3b82f6] hover:bg-[#3b82f6]/5"
                  >
                    <UploadCloud className="h-12 w-12 text-[#3b82f6]" />
                    <span className="mt-5 text-xl font-semibold text-zinc-100">{t.upload.title}</span>
                    <span className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">{t.upload.hint}</span>
                    <span className="mt-5 rounded border border-[#27272a] bg-[#111113] px-3 py-2 font-mono text-xs text-zinc-300">{t.upload.formats}</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl,.step,.stp,.obj,.ply,.glb,.3mf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </div>

              <aside className="min-h-[460px] bg-[#18181b] p-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#27272a] bg-[#1f1f23] text-sm font-semibold text-zinc-100 transition hover:border-[#3b82f6] hover:bg-[#27272a]"
                >
                  <FileUp className="h-4 w-4" />
                  {t.upload.choose}
                </button>

                <div className="mb-4 rounded-md border border-[#27272a] bg-[#1f1f23] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase text-zinc-400">Status</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#93c5fd]">
                      {status.includes('ing') || status.includes('Parsing') || status.includes('Reading') ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      {status}
                    </span>
                  </div>
                  {fileMeta ? (
                    <div className="mt-3 min-w-0 font-mono text-xs text-zinc-400">
                      <div className="truncate text-zinc-200">{fileMeta.name}</div>
                      <div className="mt-1">{formatFileSize(fileMeta.size)} / {fileMeta.format.toUpperCase()}</div>
                    </div>
                  ) : null}
                  {error ? <div className="mt-3 rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">{error}</div> : null}
                </div>

                {activeTab === 'convert' ? (
                  <div className="grid gap-4">
                    <h2 className="text-lg font-semibold">{t.convert.title}</h2>
                    <label className="grid gap-2 text-sm text-zinc-400">
                      {t.convert.target}
                      <div className="relative">
                        <select value={targetFormat} onChange={(event) => setTargetFormat(event.target.value as MeshModelFormat)} className="h-11 w-full appearance-none rounded-md border border-[#27272a] bg-[#1f1f23] px-3 text-zinc-100 outline-none transition focus:border-[#3b82f6]">
                          {meshModelFormats.map((format) => (
                            <option key={format} value={format}>{format.toUpperCase()}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500" />
                      </div>
                    </label>
                    <button type="button" disabled={!modelObject} onClick={() => void runConversion()} className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#3b82f6] text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:border disabled:border-[#27272a] disabled:bg-[#1f1f23] disabled:text-zinc-500">
                      <Sparkles className="h-4 w-4" />
                      {t.convert.title}
                    </button>
                    {conversion ? (
                      <a href={conversion.url} download={conversion.fileName} className="flex h-11 items-center justify-center gap-2 rounded-md border border-white bg-white text-sm font-semibold text-[#09090b] transition hover:bg-zinc-200">
                        <Download className="h-4 w-4" />
                        {t.convert.download}
                      </a>
                    ) : (
                      <p className="text-sm leading-6 text-zinc-400">{t.convert.empty}</p>
                    )}
                  </div>
                ) : null}

                {activeTab === 'quote' ? (
                  <div className="grid gap-4">
                    <h2 className="text-lg font-semibold">{t.quote.title}</h2>
                    <label className="grid gap-2 text-sm text-zinc-400">
                      {t.quote.material}
                      <select value={selectedMaterialId} onChange={(event) => setSelectedMaterialId(event.target.value)} className="h-11 rounded-md border border-[#27272a] bg-[#1f1f23] px-3 text-zinc-100 outline-none transition focus:border-[#3b82f6]">
                        {defaultMaterials.map((material) => (
                          <option key={material.id} value={material.id}>{material.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-zinc-400">
                      {t.quote.quantity}
                      <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="h-11 rounded-md border border-[#27272a] bg-[#1f1f23] px-3 text-zinc-100 outline-none transition focus:border-[#3b82f6]" />
                    </label>
                    <div className="rounded-md border border-[#3b82f6]/35 bg-[#3b82f6]/10 p-4">
                      <div className="text-xs font-semibold uppercase text-zinc-300">{t.quote.reference}</div>
                      <div className="mt-2 text-3xl font-semibold text-white">{formatMoney(quote?.finalPrice)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                      <div>{t.quote.process}: {selectedMaterial.process.toUpperCase()}</div>
                      <div>{t.quote.lead}: {selectedMaterial.leadTimeDays}d</div>
                    </div>
                  </div>
                ) : null}

              </aside>
            </div>
            )}
          </div>
        </div>

        <aside id="how" className="grid content-start gap-4">
          <div className="rounded-md border border-[#27272a] bg-[#18181b] p-4">
            <h2 className="text-lg font-semibold">{t.quote.title}</h2>
            {measurement ? (
              <div className="mt-4 grid gap-3">
                <Metric label={t.quote.dimensions} value={`${formatNumber(measurement.dimensionsMm.x)} x ${formatNumber(measurement.dimensionsMm.y)} x ${formatNumber(measurement.dimensionsMm.z)} mm`} />
                <Metric label={t.quote.volume} value={`${formatNumber(measurement.volumeCm3, 2)} cm3`} />
                <Metric label={t.quote.surface} value={`${formatNumber(measurement.surfaceAreaMm2, 0)} mm2`} />
                <Metric label={t.quote.triangles} value={formatNumber(measurement.triangleCount, 0)} />
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-400">{t.quote.empty}</p>
            )}
          </div>

          <div id="privacy" className="rounded-md border border-[#27272a] bg-[#18181b] p-5">
            <div className="mb-3 flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-[#34d399]" />
              <h2 className="text-lg font-semibold">{t.trust.title}</h2>
            </div>
            <p className="text-sm leading-6 text-zinc-400">{t.trust.subtitle}</p>
            <div className="mt-5 grid gap-3">
              <InfoPill icon={ShieldCheck}>{t.trust.ssl}</InfoPill>
              <InfoPill icon={CheckCircle2}>{t.trust.delete}</InfoPill>
              <InfoPill icon={Bot}>{t.trust.training}</InfoPill>
            </div>
          </div>
        </aside>
      </section>

      <footer className="border-t border-[#27272a] px-4 py-8 text-sm text-zinc-600 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row">
          <span>© 2026 3daide. {t.footer.rights}</span>
          <div className="flex gap-4">
            <a className="hover:text-zinc-200" href="/terms" target="_blank" rel="noreferrer">{t.footer.terms}</a>
            <a className="hover:text-zinc-200" href="/privacy" target="_blank" rel="noreferrer">{t.footer.privacy}</a>
          </div>
        </div>
      </footer>
      <DocumentModal content={modalContent} onClose={() => setModalContent(null)} />
    </main>
  );
}
