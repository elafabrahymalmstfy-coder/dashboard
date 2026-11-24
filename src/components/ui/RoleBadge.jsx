import { Eye, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function RoleBadge({ role = 'viewer' }) {
  const { t } = useLanguage();
  const isAdmin = role === 'admin';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isAdmin
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {isAdmin ? (
        <ShieldCheck className="h-3.5 w-3.5" />
      ) : (
        <Eye className="h-3.5 w-3.5" />
      )}
      {t(isAdmin ? 'role.admin' : 'role.viewer')}
    </span>
  );
}
