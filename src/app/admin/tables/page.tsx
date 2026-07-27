'use client';

import { TableManagement } from '@/components/TableManagement';
import { useEffect, useState } from 'react';
import { getRestaurantTables, addRestaurantTable, updateRestaurantTable, deleteRestaurantTable } from '@/lib/actions';

const SITE_URL = 'https://dolphin-cafe-and-restaurant.vercel.app';

const seedTables = async () => {
  const locations = ['Main Hall', 'Terrace', 'VIP Room', 'Garden', 'Balcony'];
  for (let i = 1; i <= 15; i++) {
    const capacity = i <= 5 ? 2 : i <= 10 ? 4 : 6;
    const location = locations[i % locations.length];
    const qrCode = `${SITE_URL}/menu/${i}`;
    await addRestaurantTable({ number: i.toString(), capacity, location, qr_code: qrCode, status: 'available' });
  }
};

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState('');

  const loadTables = async () => {
    setSeedError('');
    try {
      const data = await getRestaurantTables();
      setTables(data);
    } catch (e: any) {
      setSeedError(e.message);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedError('');
    try {
      const existing = await getRestaurantTables();
      if (existing.length > 0) {
        for (const t of existing) await deleteRestaurantTable(t.id);
      }
      await seedTables();
      await loadTables();
    } catch (e: any) {
      setSeedError(e.message);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    // Auth guaranteed by middleware — fetch immediately
    loadTables();
  }, []);

  const handleAdd = async (table: any) => {
    const qrCode = `${SITE_URL}/menu/${table.number}`;
    await addRestaurantTable({ ...table, qr_code: qrCode });
    setTables(await getRestaurantTables());
  };
  const handleEdit = async (id: number, table: any) => {
    await updateRestaurantTable(id, table);
    setTables(await getRestaurantTables());
  };
  const handleDelete = async (id: number) => {
    await deleteRestaurantTable(id);
    setTables(await getRestaurantTables());
  };

  const mappedTables = tables.map((t: any) => ({
    id: t.id, number: t.number, capacity: t.capacity, location: t.location, qrCode: t.qr_code, status: t.status,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Tables</h1>
        <button onClick={handleSeed} disabled={seeding}
          className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.08] transition-all disabled:opacity-50 flex items-center gap-2">
          {seeding ? 'Creating...' : tables.length === 0 ? 'Create 15 Tables' : 'Reset 15 Tables'}
        </button>
      </div>
      {seedError && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{seedError}</div>
      )}
      <TableManagement tables={mappedTables} onAdd={handleAdd} onEdit={handleEdit as any} onDelete={handleDelete} />
    </div>
  );
}
