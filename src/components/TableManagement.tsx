'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Edit, Trash2, Download, Copy, MapPin, Users, QrCode, X, Table2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Table {
  id: number; number: string; capacity: number; location: string; qrCode: string; status: 'available' | 'occupied' | 'reserved';
}

interface TableManagementProps {
  tables: Table[];
  onAdd: (table: Omit<Table, 'id' | 'qrCode'>) => void;
  onEdit: (id: number, table: Partial<Table>) => void;
  onDelete: (id: number) => void;
}

export function TableManagement({ tables, onAdd, onEdit, onDelete }: TableManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const getMenuUrl = (tableNumber: string) => `${window.location.origin}/menu/${tableNumber}`;

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    available: { label: 'Available', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    occupied: { label: 'Occupied', color: 'text-red-400', bg: 'bg-red-500/10' },
    reserved: { label: 'Reserved', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
            <Table2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Tables</h1>
            <p className="text-xs text-white/40">{tables.length} tables</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#2563EB]/20">
          <Plus className="w-4 h-4" /> Add Table
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {tables.map((table, i) => {
            const sc = statusConfig[table.status] || statusConfig.available;
            return (
              <motion.div key={table.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-5 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">Table {table.number}</h3>
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', sc.bg, sc.color)}>{sc.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTable(table); setIsModalOpen(true); }}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-[#2563EB] transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(table.id)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Users className="w-3.5 h-3.5 text-white/30" />
                    Capacity: {table.capacity} guests
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <MapPin className="w-3.5 h-3.5 text-white/30" />
                    {table.location}
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={table.status}
                    onChange={(e) => onEdit(table.id, { status: e.target.value as any })}
                    className={cn(
                      'flex-1 px-2 py-2 rounded-xl text-xs font-medium border transition-all appearance-none cursor-pointer text-center',
                      table.status === 'available' && 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
                      table.status === 'reserved' && 'bg-amber-500/15 border-amber-500/30 text-amber-400',
                      table.status === 'occupied' && 'bg-red-500/15 border-red-500/30 text-red-400',
                    )}
                  >
                    <option value="available" className="bg-[#0a0a12] text-emerald-400">Available</option>
                    <option value="reserved" className="bg-[#0a0a12] text-amber-400">Reserved</option>
                    <option value="occupied" className="bg-[#0a0a12] text-red-400">Occupied</option>
                  </select>
                  <button onClick={() => setSelectedTable({ ...table, qrCode: getMenuUrl(table.number) })}
                    className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-medium hover:bg-white/[0.08] hover:text-[#2563EB] transition-all flex items-center justify-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" /> QR
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {tables.length === 0 && (
        <div className="text-center py-16"><Table2 className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-sm text-white/30">No tables yet</p></div>
      )}

      {/* QR Modal */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0a0a12] to-[#050508] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Table {selectedTable.number} QR</h2>
                <button onClick={() => setSelectedTable(null)} className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG id={`qr-${selectedTable.id}`} value={selectedTable.qrCode} size={200} level="H" includeMargin fgColor="#1D4ED8" bgColor="#ffffff" />
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={() => {
                  const svg = document.getElementById(`qr-${selectedTable.id}`);
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => { canvas.width = img.width; canvas.height = img.height; ctx?.drawImage(img, 0, 0); const png = canvas.toDataURL('image/png'); const a = document.createElement('a'); a.download = `table-${selectedTable.number}-qr.png`; a.href = png; a.click(); };
                    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                  }
                }}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download QR
                </button>
                <button onClick={() => navigator.clipboard.writeText(selectedTable.qrCode)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copy Link
                </button>
              </div>
              <p className="mt-4 text-xs text-white/30 text-center">Print and place on table for customers to scan</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0a0a12] to-[#050508] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editingTable ? 'Edit Table' : 'Add Table'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.target as HTMLFormElement);
                if (editingTable) onEdit(editingTable.id, { number: data.get('number') as string, capacity: parseInt(data.get('capacity') as string), location: data.get('location') as string, status: data.get('status') as any });
                else onAdd({ number: data.get('number') as string, capacity: parseInt(data.get('capacity') as string), location: data.get('location') as string, status: data.get('status') as any });
                setIsModalOpen(false);
              }}>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Table Number</label>
                  <input type="text" name="number" defaultValue={editingTable?.number}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Capacity (Guests)</label>
                  <input type="number" name="capacity" defaultValue={editingTable?.capacity}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Location</label>
                  <input type="text" name="location" defaultValue={editingTable?.location}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Status</label>
                  <select name="status" defaultValue={editingTable?.status || 'available'}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#2563EB]/50 transition-all">
                    <option value="available" className="bg-[#0a0a12]">Available</option>
                    <option value="occupied" className="bg-[#0a0a12]">Occupied</option>
                    <option value="reserved" className="bg-[#0a0a12]">Reserved</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.04] transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all">
                    {editingTable ? 'Update' : 'Add Table'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
