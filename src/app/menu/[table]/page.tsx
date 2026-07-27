import { getMenuItems, getRestaurantSettings } from '@/lib/actions';
import { MenuView } from '@/components/MenuView';

export const dynamic = 'force-dynamic';

export default async function TableMenu({ params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;

  // Fetch in parallel on the server
  const [menuItems, settings] = await Promise.all([
    getMenuItems().catch(() => []),
    getRestaurantSettings().catch(() => null)
  ]);

  return (
    <MenuView
      key={table}
      tableNumber={table}
      initialMenuItems={menuItems}
      initialSettings={settings}
    />
  );
}
