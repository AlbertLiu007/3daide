'use client';

import {
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileUp,
  Settings2,
  Github,
  Languages,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
type ThemePreference = 'light' | 'dark' | 'system';

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

function applyThemePreference(preference: ThemePreference) {
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = preference === 'system' ? (prefersLight ? 'light' : 'dark') : preference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
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
  const [pricingRulesOpen, setPricingRulesOpen] = useState(false);
  const [targetFormatMenuOpen, setTargetFormatMenuOpen] = useState(false);
  const [materialMenuOpen, setMaterialMenuOpen] = useState(false);
  const [materialOverrides, setMaterialOverrides] = useState<Record<string, Partial<typeof defaultMaterials[number]>>>({});
  const [betaEmail, setBetaEmail] = useState('');
  const [betaBusy, setBetaBusy] = useState(false);
  const [betaMessage, setBetaMessage] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<DocumentModalContent | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('3daide.theme');
    const initialPreference: ThemePreference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setThemePreference(initialPreference);
    applyThemePreference(initialPreference);

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemThemeChange = () => {
      if ((localStorage.getItem('3daide.theme') || 'system') === 'system') applyThemePreference('system');
    };
    media.addEventListener('change', handleSystemThemeChange);
    return () => media.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const selectedMaterialBase = defaultMaterials.find((material) => material.id === selectedMaterialId) ?? defaultMaterials[0];
  const selectedMaterial = {
    ...selectedMaterialBase,
    ...(materialOverrides[selectedMaterialId] ?? {}),
    id: selectedMaterialBase.id,
  };
  const quote = useMemo<QuoteResult | null>(() => {
    if (!measurement) return null;
    return calculateQuote({ measurement, material: selectedMaterial, quantity });
  }, [measurement, quantity, selectedMaterial]);
  const boundingBoxVolumeCm3 = measurement ? measurement.boundingBoxVolumeMm3 / 1000 : null;
  const solidityRatio = measurement?.volumeCm3 && boundingBoxVolumeCm3 && boundingBoxVolumeCm3 > 0 ? (measurement.volumeCm3 / boundingBoxVolumeCm3) * 100 : null;

  function updateSelectedMaterial(patch: Partial<typeof selectedMaterialBase>) {
    setMaterialOverrides((current) => ({
      ...current,
      [selectedMaterialId]: {
        ...(current[selectedMaterialId] ?? {}),
        ...patch,
      },
    }));
  }

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
      setBetaMessage(t.dfm.betaSuccess);
    } catch {
      setBetaMessage(t.dfm.betaError);
    } finally {
      setBetaBusy(false);
    }
  }

  const tabs: Array<{ id: ToolTab; label: string; icon: typeof UploadCloud }> = [
    { id: 'convert', label: t.tabs.convert, icon: UploadCloud },
    { id: 'quote', label: t.tabs.quote, icon: Sparkles },
    { id: 'dfm', label: t.tabs.dfm, icon: Bot },
  ];
  const themeOptions: Array<{ id: ThemePreference; label: string }> = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];
  const currentThemeLabel = themeOptions.find((option) => option.id === themePreference)?.label ?? 'System';

  return (
    <main dir={dir} className="min-h-screen bg-[#09090b] text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-400 lg:flex">
            <button type="button" className="interactive-hover rounded-md border border-transparent px-2 py-1" onClick={() => setModalContent(howItWorks)}>
              {t.nav.how}
            </button>
            <button type="button" className="interactive-hover rounded-md border border-transparent px-2 py-1" onClick={() => setModalContent(privacySecurity)}>
              {t.nav.privacy}
            </button>
            <a className="interactive-hover inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1" href="https://github.com/AlbertLiu007/3daide/issues" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              {t.nav.github}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={themeMenuOpen}
                onClick={() => {
                  setLocaleMenuOpen(false);
                  setThemeMenuOpen((current) => !current);
                }}
                className="interactive-hover flex h-[34px] min-w-[92px] items-center justify-center gap-1 rounded-md border border-[var(--border-muted)] bg-[var(--panel-bg)] px-2 text-xs font-semibold text-[var(--text-secondary)]"
              >
                {currentThemeLabel}
                <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-muted)] transition ${themeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {themeMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-10 z-40 w-36 rounded-md border border-[var(--border-muted)] bg-[var(--panel-bg)] p-1.5 text-[var(--text-secondary)] shadow-[0_14px_34px_-18px_rgba(15,23,42,0.42)]"
                >
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={themePreference === option.id}
                      onClick={() => {
                        localStorage.setItem('3daide.theme', option.id);
                        setThemePreference(option.id);
                        applyThemePreference(option.id);
                        setThemeMenuOpen(false);
                      }}
                      className="menu-item-hover flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs font-semibold"
                    >
                      <span className="flex w-4 justify-center text-[var(--text-strong)]">
                        {themePreference === option.id ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={localeMenuOpen}
                onClick={() => {
                  setThemeMenuOpen(false);
                  setLocaleMenuOpen((current) => !current);
                }}
                className="interactive-hover flex h-[34px] min-w-[116px] items-center justify-center gap-1.5 rounded-md border border-[var(--border-muted)] bg-[var(--panel-bg)] px-2 text-xs font-semibold text-[var(--text-secondary)]"
              >
                <Languages className="h-4 w-4 text-[#3b82f6]" />
                <span>{dictionaries[locale].localeName}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-muted)] transition ${localeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {localeMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-10 z-40 w-36 rounded-md border border-[var(--border-muted)] bg-[var(--panel-bg)] p-1.5 text-[var(--text-secondary)] shadow-[0_14px_34px_-18px_rgba(15,23,42,0.42)]"
                >
                  {locales.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="menuitemradio"
                      aria-checked={locale === item}
                      onClick={() => {
                        setLocale(item);
                        setLocaleMenuOpen(false);
                      }}
                      className="menu-item-hover flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs font-semibold"
                    >
                      <span className="flex w-4 justify-center text-[var(--text-strong)]">
                        {locale === item ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      {dictionaries[item].localeName}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
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
                    onClick={() => {
                      setTargetFormatMenuOpen(false);
                      setMaterialMenuOpen(false);
                      setActiveTab(tab.id);
                    }}
                    className={`relative flex h-12 flex-1 items-center justify-center gap-2 border-b-2 text-sm font-semibold transition ${
                      activeTab === tab.id ? 'border-[#3b82f6] bg-[#27272a]/45 text-white' : 'interactive-hover border-transparent text-zinc-500'
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
                  <h2 className="text-[22px] font-semibold leading-tight text-white">{t.dfm.comingSoonTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {t.dfm.comingSoonBody}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-zinc-100">{t.dfm.betaPrompt}</p>
                  <div className="mt-3 grid gap-3">
                    <label className="grid gap-2 text-sm text-zinc-400">
                      {t.dfm.emailLabel}
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                        <input
                          type="email"
                          value={betaEmail}
                          onChange={(event) => setBetaEmail(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') void joinBeta();
                          }}
                          placeholder={t.dfm.emailPlaceholder}
                          className="field-interactive h-10 w-full rounded-md border border-[#27272a] bg-[#18181b] pl-10 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                        />
                      </div>
                    </label>
                    <button
                      type="button"
                      data-umami-event="submit-ai-beta-email"
                      onClick={() => void joinBeta()}
                      disabled={betaBusy}
                      className="primary-action flex h-10 items-center justify-center gap-2 rounded-md border border-[#3b82f6] bg-[#3b82f6] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#27272a] disabled:text-zinc-500"
                    >
                      {betaBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {t.dfm.joinBeta}
                    </button>
                    {betaMessage ? <p className="text-sm leading-6 text-zinc-300">{betaMessage}</p> : null}
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div
                data-umami-event="upload-3d-model"
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
                    className="interactive-hover upload-dropzone absolute inset-5 flex flex-col items-center justify-center rounded-md border border-dashed border-[#27272a] bg-[#09090b]/45 text-center"
                  >
                    <UploadCloud className="h-12 w-12 text-[#3b82f6]" />
                    <span className="upload-dropzone-title mt-5 text-xl font-semibold text-zinc-100">{t.upload.title}</span>
                    <span className="upload-dropzone-hint mt-2 max-w-sm text-sm leading-6 text-zinc-400">{t.upload.hint}</span>
                    <span className="upload-dropzone-formats mt-5 rounded border border-[#27272a] bg-[#111113] px-3 py-2 font-mono text-xs text-zinc-300">{t.upload.formats}</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  data-umami-event="upload-3d-model"
                  accept=".stl,.step,.stp,.obj,.ply,.glb,.3mf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </div>

              <aside className="max-h-[460px] min-h-[460px] overflow-y-auto bg-[#18181b] p-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="secondary-action mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#27272a] bg-[#1f1f23] text-sm font-semibold text-zinc-100"
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
                        <button
                          type="button"
                          aria-haspopup="menu"
                          aria-expanded={targetFormatMenuOpen}
                          onClick={() => {
                            setMaterialMenuOpen(false);
                            setTargetFormatMenuOpen((current) => !current);
                          }}
                          className="field-interactive flex h-11 w-full items-center justify-between rounded-md border border-[#27272a] bg-[#1f1f23] px-3 text-left text-zinc-100 outline-none"
                        >
                          <span>{targetFormat.toUpperCase()}</span>
                          <ChevronDown className={`h-4 w-4 text-zinc-500 transition ${targetFormatMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {targetFormatMenuOpen ? (
                          <div role="menu" className="absolute left-0 right-0 top-12 z-30 rounded-md border border-[var(--border-muted)] bg-[var(--panel-bg)] p-1.5 text-[var(--text-secondary)] shadow-[0_14px_34px_-18px_rgba(15,23,42,0.42)]">
                            {meshModelFormats.map((format) => (
                              <button
                                key={format}
                                type="button"
                                role="menuitemradio"
                                aria-checked={targetFormat === format}
                                onClick={() => {
                                  setTargetFormat(format);
                                  setTargetFormatMenuOpen(false);
                                }}
                                className="menu-item-hover flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs font-semibold"
                              >
                                <span className="flex w-4 justify-center text-[var(--text-strong)]">
                                  {targetFormat === format ? <Check className="h-3.5 w-3.5" /> : null}
                                </span>
                                {format.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </label>
                    <button type="button" disabled={!modelObject} onClick={() => void runConversion()} className="primary-action flex h-11 items-center justify-center gap-2 rounded-md border border-[#3b82f6] bg-[#3b82f6] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:border disabled:border-[#27272a] disabled:bg-[#1f1f23] disabled:text-zinc-500">
                      <Sparkles className="h-4 w-4" />
                      {t.convert.title}
                    </button>
                    {conversion ? (
                      <a href={conversion.url} download={conversion.fileName} data-umami-event="download-converted-file" className="primary-action flex h-11 items-center justify-center gap-2 rounded-md border border-[#3b82f6] bg-[#3b82f6] text-sm font-semibold text-white">
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
                      <div className="relative">
                        <button
                          type="button"
                          aria-haspopup="menu"
                          aria-expanded={materialMenuOpen}
                          onClick={() => {
                            setTargetFormatMenuOpen(false);
                            setMaterialMenuOpen((current) => !current);
                          }}
                          className="field-interactive flex h-11 w-full items-center justify-between rounded-md border border-[#27272a] bg-[#1f1f23] px-3 text-left text-zinc-100 outline-none"
                        >
                          <span>{selectedMaterial.name}</span>
                          <ChevronDown className={`h-4 w-4 text-zinc-500 transition ${materialMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {materialMenuOpen ? (
                          <div role="menu" className="absolute left-0 right-0 top-12 z-30 rounded-md border border-[var(--border-muted)] bg-[var(--panel-bg)] p-1.5 text-[var(--text-secondary)] shadow-[0_14px_34px_-18px_rgba(15,23,42,0.42)]">
                            {defaultMaterials.map((material) => (
                              <button
                                key={material.id}
                                type="button"
                                role="menuitemradio"
                                aria-checked={selectedMaterialId === material.id}
                                onClick={() => {
                                  setSelectedMaterialId(material.id);
                                  setMaterialMenuOpen(false);
                                }}
                                className="menu-item-hover flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs font-semibold"
                              >
                                <span className="flex w-4 justify-center text-[var(--text-strong)]">
                                  {selectedMaterialId === material.id ? <Check className="h-3.5 w-3.5" /> : null}
                                </span>
                                {material.name}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </label>
                    <label className="grid gap-2 text-sm text-zinc-400">
                      {t.quote.quantity}
                      <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="field-interactive h-11 rounded-md border border-[#27272a] bg-[#1f1f23] px-3 text-zinc-100 outline-none" />
                    </label>
                    <div className="grid gap-2 rounded-md border border-[#27272a] bg-[#1f1f23] p-3">
                      <div className="flex items-center justify-between gap-3 border-b border-[#27272a] pb-2">
                        <span className="text-xs font-semibold uppercase text-zinc-400">{t.quote.engineeringMetrics}</span>
                        <span className="text-[11px] font-semibold text-zinc-500">{selectedMaterial.name}</span>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-zinc-400">{t.quote.estimatedWeight}</span>
                          <span className="text-right font-semibold text-zinc-100">
                            {formatNumber(quote?.estimatedWeightG, 2)} g
                          </span>
                        </div>
                        <p className="text-xs leading-5 text-zinc-500">{t.quote.weightDensityNote(formatNumber(selectedMaterial.densityGPerCm3, 2))}</p>
                        <div className="flex justify-between gap-3">
                          <span className="text-zinc-400">{t.quote.boundingBox}</span>
                          <span className="text-right font-semibold text-zinc-100">{formatNumber(boundingBoxVolumeCm3, 2)} cm³</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-zinc-400">{t.quote.solidityRatio}</span>
                          <span className="text-right font-semibold text-zinc-100">{formatNumber(solidityRatio, 1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border border-[#3b82f6]/35 bg-[#3b82f6]/10 p-4">
                      <div className="text-xs font-semibold uppercase text-zinc-300">{t.quote.reference}</div>
                      <div className="mt-2 text-3xl font-semibold text-white">{formatMoney(quote?.finalPrice)}</div>
                    </div>
                    <button
                      type="button"
                      data-umami-event="click-customize-pricing"
                      onClick={() => setPricingRulesOpen((current) => !current)}
                      className="secondary-action flex h-10 items-center justify-center gap-2 rounded-md border border-[#27272a] bg-[#1f1f23] text-sm font-semibold text-zinc-300"
                    >
                      <Settings2 className="h-4 w-4" />
                      {t.quote.customizePricingRules}
                    </button>
                    {pricingRulesOpen ? (
                      <div className="grid gap-3 rounded-md border border-[#27272a] bg-[#1f1f23] p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <label className="grid min-w-0 gap-1 text-xs text-zinc-400">
                            {t.quote.density}
                            <input type="number" step="0.01" value={selectedMaterial.densityGPerCm3} onChange={(event) => updateSelectedMaterial({ densityGPerCm3: Number(event.target.value) })} className="field-interactive h-9 w-full min-w-0 rounded-md border border-[#27272a] bg-[#18181b] px-2 text-sm text-zinc-100 outline-none" />
                            <span className="text-[11px] text-zinc-500">g/cm³</span>
                          </label>
                          <label className="grid min-w-0 gap-1 text-xs text-zinc-400">
                            {t.quote.materialPrice}
                            <input type="number" step="0.01" value={selectedMaterial.materialPricePerG} onChange={(event) => updateSelectedMaterial({ materialPricePerG: Number(event.target.value) })} className="field-interactive h-9 w-full min-w-0 rounded-md border border-[#27272a] bg-[#18181b] px-2 text-sm text-zinc-100 outline-none" />
                            <span className="text-[11px] text-zinc-500">$/g</span>
                          </label>
                          <label className="grid min-w-0 gap-1 text-xs text-zinc-400">
                            {t.quote.surfacePrice}
                            <input type="number" step="0.000001" value={selectedMaterial.surfaceAreaPricePerMm2} onChange={(event) => updateSelectedMaterial({ surfaceAreaPricePerMm2: Number(event.target.value) })} className="field-interactive h-9 w-full min-w-0 rounded-md border border-[#27272a] bg-[#18181b] px-2 text-sm text-zinc-100 outline-none" />
                            <span className="text-[11px] text-zinc-500">$/mm²</span>
                          </label>
                          <label className="grid min-w-0 gap-1 text-xs text-zinc-400">
                            {t.quote.failureBuffer}
                            <input type="number" step="1" value={Math.round(selectedMaterial.failureRate * 100)} onChange={(event) => updateSelectedMaterial({ failureRate: Number(event.target.value) / 100 })} className="field-interactive h-9 w-full min-w-0 rounded-md border border-[#27272a] bg-[#18181b] px-2 text-sm text-zinc-100 outline-none" />
                            <span className="text-[11px] text-zinc-500">%</span>
                          </label>
                          <label className="grid min-w-0 gap-1 text-xs text-zinc-400">
                            {t.quote.markup}
                            <input type="number" step="1" value={Math.round(selectedMaterial.markupRate * 100)} onChange={(event) => updateSelectedMaterial({ markupRate: Number(event.target.value) / 100 })} className="field-interactive h-9 w-full min-w-0 rounded-md border border-[#27272a] bg-[#18181b] px-2 text-sm text-zinc-100 outline-none" />
                            <span className="text-[11px] text-zinc-500">%</span>
                          </label>
                          <label className="grid min-w-0 gap-1 text-xs text-zinc-400">
                            {t.quote.minimum}
                            <input type="number" step="1" value={selectedMaterial.materialMinimumCharge} onChange={(event) => updateSelectedMaterial({ materialMinimumCharge: Number(event.target.value) })} className="field-interactive h-9 w-full min-w-0 rounded-md border border-[#27272a] bg-[#18181b] px-2 text-sm text-zinc-100 outline-none" />
                            <span className="text-[11px] text-zinc-500">$</span>
                          </label>
                        </div>
                      </div>
                    ) : null}
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
                <Metric label={t.quote.estimatedWeight} value={`${formatNumber(quote?.estimatedWeightG, 2)} g`} />
                <Metric label={t.quote.surface} value={`${formatNumber(measurement.surfaceAreaMm2, 0)} mm2`} />
                <Metric label={t.quote.boundingBox} value={`${formatNumber(boundingBoxVolumeCm3, 2)} cm3`} />
                <Metric label={t.quote.solidityRatio} value={`${formatNumber(solidityRatio, 1)}%`} />
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
            <a className="interactive-hover rounded-md border border-transparent px-2 py-1" href="/terms" target="_blank" rel="noreferrer">{t.footer.terms}</a>
            <a className="interactive-hover rounded-md border border-transparent px-2 py-1" href="/privacy" target="_blank" rel="noreferrer">{t.footer.privacy}</a>
          </div>
        </div>
      </footer>
      <DocumentModal content={modalContent} onClose={() => setModalContent(null)} />
    </main>
  );
}
