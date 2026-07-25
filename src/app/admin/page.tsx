'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingCart, DollarSign, ArrowUpRight,
  ArrowDownRight, Clock, Star, ChefHat, Utensils,
  Table, Sparkles, Activity
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getMenuItems, getOrders } from '@/lib/actions';
import { getCached, setCache } from '@/lib/cache';
import { cn } from '@/lib/utils';

const MENU_CACHE = 'admin_menu_items_v2';
const ORDERS_CACHE = 'admin_orders';

const quickActions = [
  { label: 'Menu', href: '/admin/menu', icon: Utensils, desc: 'Manage dishes & categories', color: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/20', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, desc: 'Track & fulfill orders', color: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/20', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
  { label: 'Tables', href: '/admin/tables', icon: Table, desc: 'Manage seating & QR', color: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  // Load from cache immediately — no loading state
  const [menuItems, setMenuItems] = useState<any[]>(() => getCached<any[]>(MENU_CACHE) ?? []);
  const [orders, setOrders] = useState<any[]>(() => getCached<any[]>(ORDERS_CACHE) ?? []);

  useEffect(() => {
    // Auth guaranteed by middleware — fetch both in parallel
    Promise.all([
      getMenuItems().then(data => { setMenuItems(data); setCache(MENU_CACHE, data); }).catch(() => {}),
      getOrders().then(data => { setOrders(data); setCache(ORDERS_CACHE, data); }).catch(() => {}),
    ]);
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgRating = menuItems.length
    ? (menuItems.reduce((s, i) => s + i.rating, 0) / menuItems.length).toFixed(1)
    : '0.0';

  const recentOrders = orders.slice(0, 5);
  const topDishes = [...menuItems].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/5 border border-[#2563EB]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-white/40">Your restaurant at a glance</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { value: `ETB ${totalRevenue.toLocaleString()}`, label: 'Total Revenue', icon: DollarSign, trend: '+12.5%', up: true, color: 'emerald' },
          { value: orders.length.toString(), label: 'Total Orders', icon: ShoppingCart, trend: '+8.2%', up: true, color: 'blue' },
          { value: menuItems.length.toString(), label: 'Menu Items', icon: Utensils, trend: '+3.1%', up: true, color: 'amber' },
          { value: avgRating, label: 'Avg Rating', icon: Star, trend: '+0.2', up: true, color: 'purple' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemAnim}
            className="relative group cursor-pointer"
          >
            <div className={cn(
              'relative overflow-hidden rounded-2xl border p-5',
              `border-${stat.color}-500/20`,
              `bg-gradient-to-br from-${stat.color}-500/[0.07] to-${stat.color}-600/[0.03]`,
              'hover:border-opacity-40 transition-all duration-300'
            )}>
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                `bg-gradient-to-br from-${stat.color}-500/5 to-transparent`
              )} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    `bg-${stat.color}-500/15`
                  )}>
                    <stat.icon className={cn('w-5 h-5', `text-${stat.color}-400`)} />
                  </div>
                  <span className={cn(
                    'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                    stat.up ? `bg-${stat.color}-500/10 text-${stat.color}-400` : 'bg-red-500/10 text-red-400'
                  )}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <motion.div variants={itemAnim} initial="hidden" animate="show"
          className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs text-[#2563EB]/70 hover:text-[#2563EB] transition-colors">
              View All
            </Link>
          </div>
          <div className="p-5">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-400">#{order.id?.toString().slice(-4)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{order.customer || 'Guest'}</p>
                        <p className="text-xs text-white/40 truncate">
                          {order.items?.slice(0, 2).map((i: any) => i.name).join(', ')}
                          {order.items?.length > 2 ? ` +${order.items.length - 2}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-semibold text-white">ETB {order.total}</p>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        order.status === 'confirmed' && 'bg-blue-500/10 text-blue-400',
                        order.status === 'preparing' && 'bg-amber-500/10 text-amber-400',
                        order.status === 'ready' && 'bg-emerald-500/10 text-emerald-400',
                        order.status === 'served' && 'bg-[#2563EB]/10 text-[#2563EB]',
                      )}>{order.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Dishes */}
        <motion.div variants={itemAnim} initial="hidden" animate="show"
          className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Top Rated Dishes</h2>
            </div>
            <Link href="/admin/menu" className="text-xs text-[#2563EB]/70 hover:text-[#2563EB] transition-colors">
              View All
            </Link>
          </div>
          <div className="p-5">
            {topDishes.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">No dishes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topDishes.map((dish, i) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-400">#{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{dish.name}</p>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3 h-3 text-[#2563EB] fill-[#2563EB]" />
                          <span className="text-xs text-white/40">{dish.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">ETB {dish.price}</p>
                      <p className="text-xs text-white/40">{dish.category}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={container} initial="hidden" animate="show">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <motion.div key={action.label} variants={itemAnim}>
              <Link href={action.href}>
                <div className={cn(
                  'relative group rounded-xl border p-4 h-full',
                  action.border,
                  `bg-gradient-to-br ${action.color}`,
                  'hover:border-opacity-50 transition-all duration-300 cursor-pointer'
                )}>
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center mb-3',
                    action.iconBg
                  )}>
                    <action.icon className={cn('w-4 h-4', action.iconColor)} />
                  </div>
                  <p className="text-sm font-semibold text-white mb-0.5">{action.label}</p>
                  <p className="text-xs text-white/40">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
