import { getMenuItems, getRestaurantSettings } from '@/lib/actions';
import { MenuView } from '@/components/MenuView';

export const dynamic = 'force-dynamic';

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ table?: string; category?: string }> }) {
  const params = await searchParams;

  const [menuItems, settings] = await Promise.all([
    getMenuItems().catch(() => []),
    getRestaurantSettings().catch(() => null)
  ]);

  return (
    <MenuView
      tableNumber={params.table}
      initialMenuItems={menuItems}
      initialSettings={settings}
      initialCategory={params.category}
    />
  );
}
