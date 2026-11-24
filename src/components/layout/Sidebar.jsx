import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  LayoutDashboard,
  Lock,
  X,
} from 'lucide-react';
import AdminOnly from '../auth/AdminOnly';
import BrandLogo from '../ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { isAdmin, isDemoMode } = useAuth();
  const { t, isRtl } = useLanguage();

  // Logical start = left in LTR, right in RTL → mirror the slide direction too.
  const drawerClosedTransform = isRtl ? 'translate-x-full' : '-translate-x-full';

  const navLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
    } ${collapsed ? 'justify-center px-2' : ''}`;

  const CollapseIcon = isRtl ? ChevronRight : ChevronLeft;
  const ExpandIcon = isRtl ? ChevronLeft : ChevronRight;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div
          className={`flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex min-w-0 items-center">
            {collapsed ? (
              <BrandLogo variant="mark" className="h-8 w-auto" />
            ) : (
              <BrandLogo variant="horizontal" className="h-8 w-auto" />
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={t('sidebar.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 p-3">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              {t('sidebar.analytics')}
            </p>
          )}

          <NavLink
            to="/"
            end
            onClick={onCloseMobile}
            className={navLinkClass}
            title={t('sidebar.dashboard')}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t('sidebar.dashboard')}</span>}
          </NavLink>

          <AdminOnly>
            <NavLink
              to="/manage"
              onClick={onCloseMobile}
              className={navLinkClass}
              title={t('sidebar.manageData')}
            >
              <Database className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t('sidebar.manageData')}</span>}
            </NavLink>
          </AdminOnly>
        </nav>
      </div>

      {/* Footer / Access Level Info + Collapse Toggle */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {!collapsed && (
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              <Lock className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>
                {isAdmin
                  ? t('sidebar.adminAccess')
                  : t('sidebar.readonlyAccess')}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {isAdmin
                ? t('sidebar.adminAccessDesc')
                : t('sidebar.readonlyAccessDesc')}
            </p>
            {isDemoMode && (
              <p className="mt-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                {t('sidebar.previewMode')}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={
            collapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')
          }
        >
          {collapsed ? (
            <ExpandIcon className="h-4 w-4" />
          ) : (
            <>
              <CollapseIcon className="h-4 w-4" />
              <span>{t('sidebar.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer — anchored to the logical start edge */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 w-64 transform border-e border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:hidden dark:border-slate-800 dark:bg-slate-900 ${
          mobileOpen ? 'translate-x-0' : drawerClosedTransform
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-e border-slate-200 bg-white transition-all duration-200 lg:block dark:border-slate-800 dark:bg-slate-900 ${
          collapsed ? 'w-[70px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
