import { getRestaurantSettings, getMenuItems } from '@/lib/actions';
import LandingClient from '@/components/LandingClient';

export default async function Page() {
  // Fetch settings and menu items in parallel on the server (uses unstable_cache internally)
  const [settings, menuItems] = await Promise.all([
    getRestaurantSettings().catch(() => null),
    getMenuItems().catch(() => [])
  ]);

  // Compute featured dishes list on the server
  const food = menuItems.filter(Boolean).filter((item: any) => 
    !['Beverages & Drinks', 'Hot Drinks', 'Juice & Shakes', 'Soft Drinks'].includes(item.category)
  );
  
  const priority = [
    'Dolphin Special Double Beef Burger', 'Dolphin Special Burger', 'Beef Burger', 
    'Dolphin Special Pizza', 'Grilled Fish', 'Mixed Salad', 'Chicken Burger', 
    'Fish Cutlet', 'Club Sandwich'
  ];
  
  const byPriority = priority.map((n: string) => food.find((i: any) => i.name === n)).filter(Boolean);
  const rest = food.filter((i: any) => !priority.includes(i.name));
  const featured = [...byPriority, ...rest].slice(0, 6);

  return (
    <LandingClient 
      initialSettings={settings} 
      initialFeatured={featured} 
    />
  );
}
