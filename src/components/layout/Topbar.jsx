import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from '../ui/LanguageToggle';
import RoleBadge from '../ui/RoleBadge';
import ThemeToggle from '../ui/ThemeToggle';

export default function Topbar({ onOpenMobile }) {
  const { user, role, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle =
    location.pathname === '/manage'
      ? t('topbar.manageTitle')
      : t('topbar.dashboardTitle');

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={t('topbar.openMenu')}
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-50">
          {pageTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <div className="hidden max-w-[220px] flex-col items-end md:flex">
          <span className="w-full truncate text-end text-xs font-medium text-slate-600 dark:text-slate-300">
            {user?.email}
          </span>
        </div>

        <RoleBadge role={role} />

        <LanguageToggle />
        <ThemeToggle />

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          title={t('topbar.logoutTitle')}
          aria-label={t('topbar.logoutTitle')}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('topbar.logout')}</span>
        </button>
      </div>
    </header>
  );
}
