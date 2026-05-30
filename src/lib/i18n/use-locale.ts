'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDictionary, isLocale, type Locale } from './dictionaries';

const STORAGE_KEY = '3daide.locale';

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  return 'en';
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    const dictionary = getDictionary(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dictionary.dir;
  }, [locale]);

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, nextLocale);
  }

  return useMemo(() => ({ locale, setLocale, t: getDictionary(locale) }), [locale]);
}
