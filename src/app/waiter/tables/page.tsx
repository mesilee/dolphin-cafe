'use client';

import { useEffect, useState } from 'react';
import { checkWaiterAuth } from '@/lib/waiter-auth';
import { getRestaurantTables, updateRestaurantTable } from '@/lib/actions';
import { TableManagement } from '@/components/TableManagement';

export default function WaiterTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkWaiterAuth().then((authed) => {
      if (!authed) { window.location.href = '/waiter/login'; return; }
      setAuthorized(true);
      getRestaurantTables().then(setTables).catch(console.error);
    });
  }, []);

  const handleEdit = async (id: number, table: any) => {
    await updateRestaurantTable(id, table);
    setTables(await getRestaurantTables());
  };

  const mappedTables = tables.map((t: any) => ({
    id: t.id, number: t.number, capacity: t.capacity, location: t.location, qrCode: t.qr_code, status: t.status,
  }));

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-14 h-14 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }
  if (!authorized) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TableManagement
        tables={mappedTables}
        onAdd={async () => {}}
        onEdit={handleEdit}
        onDelete={async () => {}}
      />
    </div>
  );
}
