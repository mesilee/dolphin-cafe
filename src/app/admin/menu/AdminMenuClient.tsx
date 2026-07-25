'use client';

import { MenuManagement } from '@/components/MenuManagement';
import { useEffect, useState } from 'react';
import { checkAdminAuth } from '@/lib/admin-auth';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '@/lib/actions';
import { getCached, setCache } from '@/lib/cache';
import { RefreshCw, UtensilsCrossed } from 'lucide-react';

export function AdminMenuClient() {
  const [items, setItems] = useState<any[] | null>(() => getCached<any[]>('adminMenuItems'));
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAuth().then((authed) => {
      if (!authed) { window.location.href = '/admin/login'; return; }
      setAuthorized(true);
    });
    getMenuItems().then(data => {
      if (data.length > 0) { setItems(data); setCache('adminMenuItems', data); }
    }).catch(() => {});
  }, []);

  if (items === null) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-white/[0.05] rounded-lg" />
          <div className="h-10 w-28 bg-white/[0.04] rounded-xl" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="h-10 flex-1 bg-white/[0.04] rounded-xl" />
          <div className="h-10 w-40 bg-white/[0.04] rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden aspect-[3/4] bg-white/[0.03]" />
          ))}
        </div>
      </div>
    );
  }

  const refresh = async () => {
    setRefreshing(true);
    try {
      const data = await getMenuItems();
      if (data.length > 0) { setItems(data); setCache('adminMenuItems', data); }
    } catch {}
    finally { setRefreshing(false); }
  };

  const handleAdd = async (item: any) => {
    const res = await addMenuItem(item);
    if (!res.success) { alert('Failed: ' + res.error); return; }
    const next = [...(items ?? []), { ...res.data, available: true }];
    setItems(next); setCache('adminMenuItems', next);
  };

  const handleEdit = async (id: number, item: any) => {
    const res = await updateMenuItem(id, item);
    if (!res.success) { alert('Failed: ' + res.error); return; }
    const next = (items ?? []).map(i => i.id === id ? { ...i, ...item } : i);
    setItems(next); setCache('adminMenuItems', next);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMenuItem(id);
      const next = (items ?? []).filter(i => i.id !== id);
      setItems(next); setCache('adminMenuItems', next);
    } catch (e) {
      alert('Failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const displayItems = items ?? [];

  if (authorized === null) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <MenuManagement items={displayItems} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    );
  }
  if (!authorized) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-end mb-4">
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs hover:text-[#2563EB] hover:border-[#2563EB]/30 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Sync from DB'}
        </button>
      </div>
      <MenuManagement items={displayItems} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
