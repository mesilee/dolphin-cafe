'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Clock, CheckCircle, ChefHat, TrendingUp, ArrowRight } from 'lucide-react';
import { getOrders } from '@/lib/actions';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useOrderReadyNotifications, OrderReadyToast } from '@/components/OrderReadyNotification';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  preparing: { label: 'Preparing', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  served: { label: 'Served', color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function WaiterDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel('waiter-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    const interval = setInterval(fetchOrders, 5000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [fetchOrders]);

  const { notifications, dismiss } = useOrderReadyNotifications(orders);

  const activeOrders = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');
  const todayOrders = orders.filter(o => {
    const d = new Date(o.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const readyOrders = orders.filter(o => o.status === 'ready');
  const todayTotal = todayOrders.reduce((sum, o) => {
    const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items || [];
    return sum + (Array.isArray(items) ? items.reduce((s: number, it: any) => s + it.price * it.quantity, 0) : 0);
  }, 0);

  const stats = [
    { label: 'Active Orders', value: activeOrders.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Ready to Serve', value: readyOrders.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: "Today's Orders", value: todayOrders.length, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: "Today's Revenue", value: `ETB ${todayTotal.toFixed(0)}`, icon: ShoppingBag, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10' },
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-xs text-white/40">{todayOrders.length} orders today</p>
        </div>
        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">LIVE</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-4"
          >
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon className={cn('w-4 h-4', stat.color)} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Recent Orders</h2>
        <button onClick={() => router.push('/waiter/orders')}
          className="text-xs text-[#2563EB] hover:text-[#60A5FA] transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent">
          <ShoppingBag className="w-10 h-10 text-white/10 mx-auto mb-2" />
          <p className="text-sm text-white/30">No active orders</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeOrders.slice(0, 5).map((order, i) => {
            const cfg = statusConfig[order.status] || statusConfig.confirmed;
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
            const total = Array.isArray(items) ? items.reduce((s: number, it: any) => s + it.price * it.quantity, 0) : 0;
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-white/30 w-16 shrink-0">#{String(order.id).slice(-6)}</span>
                  <span className="text-sm text-white/80 truncate">{order.customer || 'Guest'}</span>
                  {order.table_number && (
                    <span className="text-xs text-white/40 shrink-0">T{order.table_number}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', cfg.bg, cfg.color)}>{cfg.label}</span>
                  <span className="text-xs text-white/50">ETB {total.toFixed(0)}</span>
                </div>
              </motion.div>
            );
          })}
          {activeOrders.length > 5 && (
            <p className="text-center text-xs text-white/30 pt-1">+{activeOrders.length - 5} more</p>
          )}
        </div>
      )}
      </div>

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <OrderReadyToast key={n.id} notification={n} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
