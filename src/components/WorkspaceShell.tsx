import React, { useEffect, useState } from 'react';
import { Bell, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useBimwin } from '../store/useBimwinStore';
import { KemenagLogo } from './UiPrimitives';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  section?: string;
}

export const WorkspaceShell: React.FC<{
  navItems: NavItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  roleLabel: string;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
  children: React.ReactNode;
}> = ({
  navItems,
  activeTab,
  onSelectTab,
  roleLabel,
  unreadNotifications = 0,
  onOpenNotifications,
  children,
}) => {
  const { currentUser, logout, darkMode, toggleDarkMode } = useBimwin();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const activeItem = navItems.find((n) => n.id === activeTab);
  const primaryTabs = navItems.slice(0, 3);

  // Group items by section preserving order
  const sections = navItems.reduce<Array<{ title: string; items: NavItem[] }>>((acc, item) => {
    const title = item.section || 'Menu Utama';
    const existing = acc.find((s) => s.title === title);
    if (existing) existing.items.push(item);
    else acc.push({ title, items: [item] });
    return acc;
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] dark:bg-[#0A110F] text-slate-900 dark:text-slate-100">
      {/* Slide-Over Navigation Drawer (Opened via Garis 3 on Desktop, Tablet & Mobile) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            aria-label="Menu navigasi ruang kerja"
            className="relative w-72 max-w-[85vw] h-full z-10 flex flex-col bg-white dark:bg-[#0D1613] border-r border-slate-200 dark:border-emerald-950 shadow-2xl"
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-emerald-950 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <KemenagLogo size="sm" />
                <div className="min-w-0 flex flex-col justify-center">
                  <img
                    src="/assets/aistudio/SAMAWA_transparent_HD_ac107033.png"
                    alt="SAMAWA"
                    className="h-6 w-auto self-start object-contain dark:bg-white/95 dark:px-1.5 dark:py-0.5 dark:rounded"
                  />
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400 truncate">
                    {roleLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-950/60 transition"
                aria-label="Tutup menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {sections.map((group) => (
                <div key={group.title} className="space-y-1">
                  <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {group.title}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === activeTab;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? 'bg-[#0F684E] text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/60'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge !== undefined && item.badge !== 0 && (
                          <span
                            className={`font-mono-num text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-emerald-950 text-slate-600 dark:text-emerald-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="p-3 border-t border-slate-200 dark:border-emerald-950 space-y-2 shrink-0">
              <div className="px-2.5 py-2 rounded-lg bg-[#F8FAF9] dark:bg-[#111C18] border border-slate-200/80 dark:border-emerald-950">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.nama}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.kua}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-300 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar Sistem
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Clean Minimal Top Bar with Always-Visible Garis 3 */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#0D1613]/95 backdrop-blur border-b border-slate-200 dark:border-emerald-950 px-4 sm:px-6 flex items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-emerald-950/60 transition shrink-0"
            aria-label="Buka menu navigasi"
            aria-expanded={drawerOpen}
          >
            <Menu className="w-4 h-4" />
          </button>
          <KemenagLogo size="sm" />
          <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline whitespace-nowrap">
              {roleLabel}
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
            <h1 className="font-bold text-slate-900 dark:text-white truncate">
              {activeItem?.label || 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Clean 3 Core Quick Tabs on Large Screens (Other Menus Inside Garis 3) */}
        <nav
          aria-label="Menu utama cepat"
          className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-emerald-950/40 p-1 rounded-xl"
        >
          {primaryTabs.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-white dark:bg-[#111C18] text-[#0F684E] dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-emerald-900 hover:bg-slate-50 dark:hover:bg-emerald-950/60 transition"
              aria-label="Kotak masuk pengingat"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono-num">
                  {unreadNotifications}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-emerald-900 hover:bg-slate-50 dark:hover:bg-emerald-950/60 transition"
            aria-label="Ganti mode tampilan"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
        {children}
      </main>

      {/* Mobile Compact Bottom Quick Bar (3 Core Tabs + Menu Garis 3) */}
      <nav
        aria-label="Navigasi cepat perangkat seluler"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#0D1613]/95 backdrop-blur border-t border-slate-200 dark:border-emerald-950 px-1.5 py-1.5 flex items-center justify-around no-print"
      >
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          const shortLabel = item.label.split(' ')[0];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg min-w-[64px] transition ${
                isActive
                  ? 'text-[#0F684E] dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] leading-tight truncate max-w-[72px]">{shortLabel}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg min-w-[64px] text-slate-500 dark:text-slate-400 font-medium"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] leading-tight">Menu</span>
        </button>
      </nav>
    </div>
  );
};
