import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { translations } from '../locales/translations';

const STORAGE_KEY = 'dashboard_lang';

const LanguageContext = createContext({
  lang: 'en',
  dir: 'ltr',
  isRtl: false,
  t: (key, values, fallback) => key,
  toggleLanguage: () => {},
  setLang: () => {},
});

function getInitialLang() {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
    return 'en';
  } catch {
    return 'en';
  }
}

function interpolate(template, values) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
  );
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Keep <html lang> and <html dir> in sync with the active language.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage write failures in restricted environments
    }
  }, [lang, dir]);

  const t = useCallback(
    (key, values, fallback) => {
      const dict = translations[lang] || translations.en;
      const raw = dict[key];

      if (raw === undefined) {
        if (fallback !== undefined) return fallback;
        // Fall back to English before showing the raw key
        const enRaw = translations.en[key];
        return enRaw !== undefined ? enRaw : key;
      }

      return interpolate(raw, values);
    },
    [lang]
  );

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      dir,
      isRtl: dir === 'rtl',
      t,
      toggleLanguage,
      setLang,
    }),
    [lang, dir, t, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
