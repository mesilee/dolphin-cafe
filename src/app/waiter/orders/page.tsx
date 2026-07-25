'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, ChefHat, Clock, XCircle, ArrowRight } from 'lucide-react';
import { getOrders, updateOrderStatus, deleteCompletedOrders } from '@/lib/actions';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useOrderReadyNotifications, OrderReadyToast } from '@/components/OrderReadyNotification';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; next?: string; nextLabel?: string }> = {
  confirmed: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-400', next: 'preparing', nextLabel: 'Start Preparing' },
  preparing: { label: 'Preparing', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400', next: 'ready', nextLabel: 'Mark Ready' },
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', next: 'served', nextLabel: 'Mark Served' },
  served: { label: 'Served', color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10', dot: 'bg-[#2563EB]' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
};

export default function WaiterOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

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
    const channel = supabase.channel('waiter-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    const interval = setInterval(fetchOrders, 5000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [fetchOrders]);

  const handleStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
  };

  const { notifications, dismiss } = useOrderReadyNotifications(orders);

  const filtered = orders.filter(o => activeTab === 'all' || (o.status !== 'served' && o.status !== 'cancelled'));
  const activeCount = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length;

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Orders</h1>
          <p className="text-xs text-white/40">{activeCount} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={async () => {
            if (confirm('Clear all served and cancelled orders?')) {
              await deleteCompletedOrders();
            }
          }}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40 hover:text-red-400 hover:border-red-500/30 text-xs font-medium transition-all">
            Clear History
          </button>
          <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">LIVE</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['active', 'all'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-3.5 py-2 rounded-xl text-xs font-medium transition-all border capitalize',
              activeTab === tab
                ? 'border-[#2563EB]/40 bg-gradient-to-r from-[#2563EB]/15 to-transparent text-[#2563EB]'
                : 'border-white/[0.06] text-white/40 hover:text-white/60'
            )}>
            {tab === 'active' ? `Active (${activeCount})` : 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const cfg = statusConfig[order.status] || statusConfig.confirmed;
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
            const total = Array.isArray(items) ? items.reduce((s: number, it: any) => s + it.price * it.quantity, 0) : 0;
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.customer || `Order #${String(order.id).slice(-6)}`}</p>
                    <p className="text-xs text-white/40">{order.table_number ? `Table ${order.table_number}` : 'Takeaway'}</p>
                  </div>
                  <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-semibold border', cfg.bg, cfg.color)}>{cfg.label}</span>
                </div>

                <div className="space-y-1 mb-3">
                  {Array.isArray(items) && items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-white/60"><span className="text-white/30">{item.quantity}x</span> {item.name}</span>
                      {item.customizations?.length > 0 && (
                        <span className="text-white/30 text-[10px]">({item.customizations.join(', ')})</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <span className="text-sm font-bold text-[#2563EB]">ETB {total.toFixed(2)}</span>
                  <div className="flex gap-2">
                    {order.status === 'ready' && (
                      <button onClick={() => handleStatus(order.id, 'served')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1">
                        Mark Served <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => handleStatus(order.id, 'preparing')}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.08] text-white/70 text-xs font-medium hover:bg-white/[0.12] transition-all flex items-center gap-1">
                        Accept <ChefHat className="w-3 h-3" />
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button onClick={() => handleStatus(order.id, 'ready')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1">
                        Ready <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
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
