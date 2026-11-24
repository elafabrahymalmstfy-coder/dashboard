import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageToggle({ className = '' }) {
  const { lang, toggleLanguage } = useLanguage();

  // Show the language you would switch TO (the UI already shows the current one).
  const targetCode = lang === 'en' ? 'AR' : 'EN';
  const targetLabel = lang === 'en' ? 'العربية' : 'English';
  const ariaLabel = lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={ariaLabel}
      title={targetLabel}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${className}`}
    >
      <Globe className="h-4 w-4 shrink-0" />
      <span className="text-xs font-semibold tracking-wide">{targetCode}</span>
    </button>
  );
}
