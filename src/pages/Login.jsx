import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabase';
import BrandLogo from '../components/ui/BrandLogo';
import LanguageToggle from '../components/ui/LanguageToggle';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Login() {
  const { user, signIn, enterDemoSession } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const { error } = await signIn({ email, password });
    setSubmitting(false);

    if (error) {
      // Known app-level codes are translated; Supabase errors pass through as-is.
      if (error.code === 'demoInvalid') {
        setErrorMsg(t('errors.demoInvalid'));
      } else {
        setErrorMsg(error.message || t('errors.unknown'));
      }
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  const handlePreviewLogin = (selectedRole) => {
    enterDemoSession(selectedRole);
    navigate(redirectTo, { replace: true });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500';
  const labelClass =
    'mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="absolute end-4 top-4 flex items-center gap-2 sm:end-6 sm:top-6">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo variant="full" className="mb-4 h-14 w-auto sm:h-16" />
          <h1 className="sr-only">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>{t('login.restricted')}</span>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={
                    showPassword ? t('login.hidePassword') : t('login.showPassword')
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          {/* Local Preview Helper — only visible when .env Supabase keys are missing */}
          {!isSupabaseConfigured && (
            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('login.previewMode')}
                </span>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  {t('login.envNotConfigured')}
                </span>
              </div>

              <p className="mb-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {t('login.previewHint')}
              </p>

              <div className="mb-3 space-y-2">
                {[
                  {
                    email: 'admin@metricgrid.io',
                    password: 'Admin@123',
                    role: 'admin',
                    labelKey: 'login.demoAdmin',
                  },
                  {
                    email: 'viewer@metricgrid.io',
                    password: 'Viewer@123',
                    role: 'viewer',
                    labelKey: 'login.demoViewer',
                  },
                ].map((acc) => (
                  <div
                    key={acc.email}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {acc.role === 'admin' ? (
                          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        )}
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {t(acc.labelKey)}
                        </span>
                      </div>
                      <div
                        className="mt-0.5 truncate font-mono text-[11px] text-slate-600 dark:text-slate-300"
                        dir="ltr"
                      >
                        {acc.email}
                      </div>
                      <div
                        className="font-mono text-[11px] text-slate-600 dark:text-slate-300"
                        dir="ltr"
                      >
                        {acc.password}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.password);
                        setErrorMsg('');
                      }}
                      className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {t('login.use')}
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePreviewLogin('admin')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t('login.previewAdmin')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewLogin('viewer')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('login.previewViewer')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
