'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag,
  Table2, LogOut,
  Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { logoutAdmin } from '@/lib/admin-auth';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: true },
  { label: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
  { label: 'Tables', href: '/admin/tables', icon: Table2 },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLogin = pathname === '/admin/login';

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
  };

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-[#0a0a12] border-r border-white/[0.06]',
          'hidden lg:flex flex-col transition-[width] duration-200',
          collapsed ? 'items-center w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-white/[0.06]',
          collapsed ? 'justify-center px-2' : 'px-5 gap-3'
        )}>
          <Image src="/dolphin-logo.png" alt="Dolphin" width={36} height={36} className="shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-white text-lg tracking-tight"
            >
              Dolphin Cafe
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center w-full rounded-xl transition-all duration-200',
                  collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3 py-2.5 gap-3',
                  active
                    ? 'bg-gradient-to-r from-[#2563EB]/15 to-transparent text-[#2563EB]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className={cn(
                      'absolute inset-0 rounded-xl border border-[#2563EB]/20',
                      collapsed ? '' : ''
                    )}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <item.icon className={cn('w-5 h-5 shrink-0', collapsed ? '' : '')} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
                {!collapsed && item.badge && (
                  <span className="ml-auto relative z-10 w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_6px_rgba(37,99,235,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle & Logout */}
        <div className="border-t border-white/[0.06] p-2 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center w-full rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all',
              collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3 py-2.5 gap-3'
            )}
          >
            <ChevronRight className={cn('w-5 h-5 transition-transform', collapsed ? '' : 'rotate-180')} />
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center w-full rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-all',
              collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3 py-2.5 gap-3'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[#0a0a12] border-b border-white/[0.06] flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-white">Dolphin Cafe</span>
        <button className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2563EB]" />
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="fixed left-0 top-0 z-50 h-screen w-[260px] bg-[#0a0a12] border-r border-white/[0.06] lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Image src="/dolphin-logo.png" alt="Dolphin" width={32} height={32} className="shrink-0" />
        <span className="font-bold text-white">Dolphin Cafe</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setMobileOpen(false); }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      active
                        ? 'bg-gradient-to-r from-[#2563EB]/15 to-transparent text-[#2563EB]'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-[#2563EB]" />
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-white/[0.06] p-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn(
        'transition-all duration-300 min-h-screen bg-[#050508]',
        'lg:pl-[280px]',
        collapsed ? 'lg:pl-[72px]' : ''
      )}>
        <div className="lg:pt-0 pt-14">
          {children}
        </div>
      </div>
    </div>
  );
}
