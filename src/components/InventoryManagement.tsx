'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, AlertTriangle, Package, TrendingUp, TrendingDown, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InventoryItem {
  id: number; name: string; category: string; quantity: number; unit: string;
  minThreshold: number; cost: number; lastRestocked: string;
}

interface InventoryManagementProps {
  items: InventoryItem[];
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
  onEdit: (id: number, item: Partial<InventoryItem>) => void;
  onDelete: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

export function InventoryManagement({ items, onAdd, onEdit, onDelete, onUpdateQuantity }: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const categories = ['all', 'meat', 'seafood', 'vegetables', 'dairy', 'spices', 'beverages', 'other'];
  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (item.name.toLowerCase().includes(q)) && (selectedCategory === 'all' || item.category === selectedCategory);
  });
  const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minThreshold) return { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Low Stock', icon: AlertTriangle };
    if (item.quantity <= item.minThreshold * 2) return { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Warning', icon: AlertTriangle };
    return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'In Stock', icon: Package };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
          <Package className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Inventory</h1>
          <p className="text-xs text-white/40">{items.length} items • {lowStockItems.length} low stock</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Items', value: items.length.toString(), icon: Package, color: 'cyan' },
          { label: 'Low Stock', value: lowStockItems.length.toString(), icon: AlertTriangle, color: 'red' },
          { label: 'Total Value', value: `ETB ${totalValue.toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className={cn(`w-9 h-9 rounded-lg flex items-center justify-center bg-${stat.color}-500/15`)}>
                <stat.icon className={cn(`w-4 h-4 text-${stat.color}-400`)} />
              </div>
              <div>
                <p className="text-xs text-white/40">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#2563EB] transition-colors z-10" />
          <input type="text" placeholder="Search inventory..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
        </div>
        <div className="relative">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#2563EB]/50 transition-all cursor-pointer">
            {categories.map(c => <option key={c} value={c} className="bg-[#0a0a12] text-white">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#2563EB]/20">
          <Plus className="w-4 h-4" /> Add Item
        </motion.button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Low Stock Alert</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span key={item.id} className="px-2.5 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg border border-red-500/20">{item.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, i) => {
            const stock = getStockStatus(item);
            return (
              <motion.div key={item.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stock.bg)}>
                      <stock.icon className={cn('w-5 h-5', stock.color)} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                      <span className="text-xs text-white/40 capitalize">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-[#2563EB] transition-all">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs"><span className="text-white/40">Quantity</span><span className="text-white font-medium">{item.quantity} {item.unit}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/40">Min Threshold</span><span className="text-white font-medium">{item.minThreshold} {item.unit}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/40">Cost / Unit</span><span className="text-[#2563EB] font-semibold">ETB {item.cost}</span></div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                  <button onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
                    <TrendingDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </button>
                  <span className={cn('ml-auto text-xs font-medium', stock.color)}>{stock.label}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No inventory items found</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0a0a12] to-[#050508] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.target as HTMLFormElement);
                const name = data.get('name') as string;
                const category = data.get('category') as string;
                const unit = data.get('unit') as string;
                const quantity = parseFloat(data.get('quantity') as string);
                const minThreshold = parseFloat(data.get('minThreshold') as string);
                const cost = parseFloat(data.get('cost') as string);
                if (editingItem) onEdit(editingItem.id, { name, category, unit, quantity, minThreshold, cost });
                else onAdd({ name, category, unit, quantity, minThreshold, cost, lastRestocked: new Date().toISOString() });
                setIsModalOpen(false);
              }}>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Item Name</label>
                  <input type="text" name="name" defaultValue={editingItem?.name}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Category</label>
                    <select name="category" defaultValue={editingItem?.category}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#2563EB]/50 transition-all" required>
                      {categories.filter(c => c !== 'all').map(c => <option key={c} value={c} className="bg-[#0a0a12]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Unit</label>
                    <input type="text" name="unit" defaultValue={editingItem?.unit}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Quantity</label>
                    <input type="number" name="quantity" defaultValue={editingItem?.quantity}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Min Threshold</label>
                    <input type="number" name="minThreshold" defaultValue={editingItem?.minThreshold}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Cost per Unit (ETB)</label>
                  <input type="number" name="cost" step="0.01" defaultValue={editingItem?.cost}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.04] transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all">
                    {editingItem ? 'Update' : 'Add Item'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
