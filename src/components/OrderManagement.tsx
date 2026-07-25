'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, CheckCircle, ChefHat, XCircle, User, ShoppingBag, Filter, Eye, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OrderItem { id: string; name: string; quantity: number; price: number; customizations: string[]; }
interface Order {
  id: string; customer: string; table: string; items: OrderItem[];
  total: number; status: 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'; time: string; notes?: string;
}

interface OrderManagementProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onViewDetails: (order: Order) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; next?: Order['status']; nextLabel?: string; icon: any }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-400', next: 'preparing', nextLabel: 'Start Preparing', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400', next: 'ready', nextLabel: 'Mark Ready', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', next: 'served', nextLabel: 'Mark Served', icon: Clock },
  served: { label: 'Served', color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10', dot: 'bg-[#2563EB]', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400', icon: XCircle },
};

export function OrderManagement({ orders, onUpdateStatus, onViewDetails }: OrderManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | Order['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    const s = selectedStatus === 'all' || order.status === selectedStatus;
    const q = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) || order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return s && q;
  });

  const statuses: ('all' | Order['status'])[] = ['all', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
  const statusCounts: Record<string, number> = { all: orders.length };
  statuses.slice(1).forEach(s => { statusCounts[s] = orders.filter(o => o.status === s).length; });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Order Management</h1>
          <p className="text-xs text-white/40">{orders.length} orders • {orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length} active</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const active = selectedStatus === status;
          const cfg = status === 'all' ? { label: 'All Orders', color: 'text-white', bg: 'bg-white/[0.06]', dot: 'bg-white/40' } : statusConfig[status];
          return (
            <button key={status} onClick={() => setSelectedStatus(status)}
              className={cn(
                'relative px-3.5 py-2 rounded-xl text-xs font-medium transition-all border',
                active
                  ? 'border-[#2563EB]/40 bg-gradient-to-r from-[#2563EB]/15 to-transparent text-[#2563EB]'
                  : 'border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-[#2563EB]' : cfg.dot)} />
                {cfg.label}
                <span className={cn('px-1.5 py-0.5 rounded text-[10px]', active ? 'bg-[#2563EB]/20' : 'bg-white/[0.06]')}>{statusCounts[status] || 0}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2563EB]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#2563EB] transition-colors z-10" />
        <input type="text" placeholder="Search by customer or order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="relative w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
      </div>

      {/* Order cards */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, i) => {
              const cfg = statusConfig[order.status] || statusConfig.confirmed;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{order.customer}</p>
                          <p className="text-[11px] text-white/40">Table {order.table} • {order.time}</p>
                        </div>
                      </div>
                      <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-semibold border', cfg.bg, cfg.color, `border-${order.status}-500/20`)}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/30">#{order.id.slice(-6)}</span>
                      <span className="text-sm font-bold text-[#2563EB]">ETB {order.total}</span>
                    </div>
                  </div>
                  {/* Items */}
                  <div className="p-4">
                    <div className="space-y-1.5 mb-3">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-white/60"><span className="text-white/30">{item.quantity}x</span> {item.name}</span>
                          <span className="text-white/40">ETB {item.price * item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <p className="text-[11px] text-[#2563EB]/60">+{order.items.length - 4} more items</p>
                      )}
                    </div>
                    {order.notes && (
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] mb-2">
                        <p className="text-xs text-white/50 italic">"{order.notes}"</p>
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="p-4 border-t border-white/[0.06] flex gap-2">
                    <button onClick={() => onViewDetails(order)}
                      className="flex-1 px-3 py-2 rounded-xl border border-white/[0.08] text-white/50 text-xs font-medium hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    {cfg.next && (
                      <button onClick={() => onUpdateStatus(order.id, cfg.next!)}
                        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-1.5">
                        {cfg.nextLabel} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
