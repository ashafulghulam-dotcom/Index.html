import React, { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = navItems.find((n) => n.id === activeTab);

  // Group items by section preserving order
  const sections = navItems.reduce<Array<{ title: string; items: NavItem[] }>>((acc, item) => {
    const title = item.section || 'Menu Utama';
    const existing = acc.find((s) => s.title === title);
    if (existing) existing.items.push(item);
    else acc.push({ title, items: [item] });
    return acc;
  }, []);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0D1613] border-r border-slate-200 dark:border-emerald-950">
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-emerald-950 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <KemenagLogo size="sm" />
          <div className="min-w-0">
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
              BIMWIN Jepara
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400 truncate">
              {roleLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
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
                    setMobileOpen(false);
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
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAF9] dark:bg-[#0A110F] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen no-print">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#0D1613]/95 backdrop-blur border-b border-slate-200 dark:border-emerald-950 px-4 sm:px-6 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300"
              aria-label="Buka navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">{roleLabel}</span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
              <h1 className="font-bold text-slate-900 dark:text-white truncate">
                {activeItem?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile & Tablet Quick Bottom Navigation Bar */}
        <nav
          aria-label="Navigasi cepat perangkat seluler"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#0D1613]/95 backdrop-blur border-t border-slate-200 dark:border-emerald-950 px-1.5 py-1.5 flex items-center justify-around no-print"
        >
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            const shortLabel = item.label.split(' ')[0];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg min-w-[60px] transition ${
                  isActive
                    ? 'text-[#0F684E] dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] leading-tight truncate max-w-[68px]">{shortLabel}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg min-w-[60px] text-slate-500 dark:text-slate-400 font-medium"
          >
            <Menu className="w-4 h-4" />
            <span className="text-[10px] leading-tight">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
