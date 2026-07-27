'use server';

import { supabase } from './supabase';
import { getCache as getRedisCache, setCache as setRedisCache, deleteCache } from './redis';
import { unstable_cache, revalidateTag } from 'next/cache';

// ---------------------------------------------------------------------------
// In-process memory cache — survives between requests in the same Node process.
// Used for large payloads (>2 MB) that exceed Next.js unstable_cache limits.
// ---------------------------------------------------------------------------
type MemEntry = { data: unknown; expiry: number };
const _memCache = new Map<string, MemEntry>();

function memGet<T>(key: string): T | null {
  const entry = _memCache.get(key);
  if (!entry || Date.now() > entry.expiry) { _memCache.delete(key); return null; }
  return entry.data as T;
}
function memSet(key: string, data: unknown, ttlSeconds: number) {
  _memCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}
export async function clearMemCache(...keys: string[]) {
  if (keys.length === 0) { _memCache.clear(); return; }
  keys.forEach(k => _memCache.delete(k));
}

// Menu Items — select without image column (8 MB), map image to /api/menu/image/[id]
export async function getMenuItems(): Promise<any[]> {
  const mem = memGet<any[]>('menuItems');
  if (mem) return mem;

  try {
    const redis = await getRedisCache<any[]>('menuItems');
    if (redis) { memSet('menuItems', redis, 300); return redis; }
  } catch (e) {
    console.warn('[actions] Redis read failed:', e);
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id,name,description,price,category,available,rating,created_at')
      .order('id');
    if (error) {
      console.error('[actions] Supabase query error:', error);
      return [];
    }

    const items = (data || []).map((item: any) => ({
      ...item,
      available: true,
      image: `/api/menu/image/${item.id}`,
    }));

    memSet('menuItems', items, 300);
    try {
      await setRedisCache('menuItems', items, 300);
    } catch (e) {
      console.warn('[actions] Redis write failed:', e);
    }
    return items;
  } catch (e) {
    console.error('[actions] getMenuItems failed:', e);
    return [];
  }
}

// Fetch a single menu item's raw image (used by admin for uploads/edits)
export async function getMenuItemImage(id: number): Promise<string | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('image')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data.image;
}

// Menu Images — also large, same strategy
export async function getMenuImages(): Promise<any[]> {
  const mem = memGet<any[]>('menuImages');
  if (mem) return mem;

  try {
    const redis = await getRedisCache<any[]>('menuImages');
    if (redis) { memSet('menuImages', redis, 600); return redis; }
  } catch (e) {
    console.warn('[actions] Redis read failed for images:', e);
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id,image')
      .order('id');
    if (error) {
      console.error('[actions] Supabase query error (images):', error);
      return [];
    }

    const images = data || [];
    memSet('menuImages', images, 600);
    try {
      await setRedisCache('menuImages', images, 600);
    } catch (e) {
      console.warn('[actions] Redis write failed for images:', e);
    }
    return images;
  } catch (e) {
    console.error('[actions] getMenuImages failed:', e);
    return [];
  }
}

export async function seedMenuItems(items: Record<string, unknown>[]) {
  const { data, error } = await supabase.from('menu_items').upsert(items, { onConflict: 'id' }).select();
  if (error) return { success: false, error: error.message };

  // Invalidate cache
  clearMemCache('menuItems', 'menuImages');
  await deleteCache('menuItems');
  await deleteCache('menuImages');

  return { success: true, data };
}

export async function addMenuItem(item: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.from('menu_items').insert(item).select();
    if (error) return { success: false, error: error.message };
    
    // Invalidate cache
    clearMemCache('menuItems', 'menuImages');
    await deleteCache('menuItems');
    await deleteCache('menuImages');
    
    return { success: true, data: data?.[0] || data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateMenuItem(id: number, item: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.from('menu_items').update(item).eq('id', id).select();
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      const { data: inserted, error: insertError } = await supabase.from('menu_items').insert({ id, ...item }).select();
      if (insertError) return { success: false, error: insertError.message };
      
      // Invalidate cache
      clearMemCache('menuItems', 'menuImages');
      await deleteCache('menuItems');
      await deleteCache('menuImages');
      
      return { success: true, data: inserted?.[0] || inserted };
    }
    
    // Invalidate cache
    clearMemCache('menuItems', 'menuImages');
    await deleteCache('menuItems');
    await deleteCache('menuImages');
    
    return { success: true, data: data[0] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteMenuItem(id: number) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  
  // Invalidate cache
  clearMemCache('menuItems', 'menuImages');
  await deleteCache('menuItems');
  await deleteCache('menuImages');
}

// Orders
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('id,customer,table_number,items,total,status,notes,created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createOrder(order: Record<string, unknown>) {
  const { data, error } = await supabase.from('orders').insert({ id: crypto.randomUUID(), ...order }).select();
  if (error) throw new Error(error.message);
  return data?.[0];
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCompletedOrders() {
  const { error } = await supabase.from('orders').delete().in('status', ['served', 'cancelled']);
  if (error) throw new Error(error.message);
}

// Inventory
export async function getInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('id,name,category,quantity,unit,min_threshold,cost,last_restocked')
    .order('id');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addInventoryItem(item: Record<string, unknown>) {
  const { data, error } = await supabase.from('inventory').insert(item).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateInventoryItem(id: number, item: Record<string, unknown>) {
  const { data, error } = await supabase.from('inventory').update(item).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInventoryItem(id: number) {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Tables
export async function getRestaurantTables() {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('id,number,capacity,location,qr_code,status')
    .order('id');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addRestaurantTable(table: Record<string, unknown>) {
  const { data, error } = await supabase.from('restaurant_tables').insert(table).select();
  if (error) throw new Error(error.message);
  return data?.[0] || data;
}

export async function updateRestaurantTable(id: number, table: Record<string, unknown>) {
  const { data, error } = await supabase.from('restaurant_tables').update(table).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data?.[0] || data;
}

export async function deleteRestaurantTable(id: number) {
  const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Staff
export async function getStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('id,name,email,phone,role,status,join_date')
    .order('id');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addStaffMember(member: Record<string, unknown>) {
  const { data, error } = await supabase.from('staff').insert(member).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateStaffMember(id: number, member: Record<string, unknown>) {
  const { data, error } = await supabase.from('staff').update(member).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteStaffMember(id: number) {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Reviews
export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('id,customer,rating,comment,date,status,response')
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateReviewStatus(id: number, status: string) {
  const { data, error } = await supabase.from('reviews').update({ status }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function respondToReview(id: number, response: string) {
  const { data, error } = await supabase.from('reviews').update({ response }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteReview(id: number) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Restaurant Settings
const getCachedRestaurantSettings = unstable_cache(
  async () => {
    // Try Redis cache first (optional/fail-fast)
    const cached = await getRedisCache<any>('restaurantSettings');
    if (cached) return cached;

    // Fetch from database
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('id,name,description,address,phone,email,website,opening_hours_weekdays,opening_hours_weekends,logo,cover_image,instagram,telegram,tiktok,youtube,facebook')
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    
    // Cache in Redis for 10 minutes
    if (data) {
      await setRedisCache('restaurantSettings', data, 600);
    }
    return data;
  },
  ['restaurant-settings'],
  { revalidate: 3600, tags: ['restaurant-settings'] }
);

export async function getRestaurantSettings() {
  return getCachedRestaurantSettings();
}

export async function saveRestaurantSettings(settings: Record<string, unknown>) {
  const existing = await getRestaurantSettings();
  if (existing) {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .update(settings)
      .eq('id', (existing as any).id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    
    // Invalidate cache
    await deleteCache('restaurantSettings');
    revalidateTag('restaurant-settings', 'default');
    return data;
  }
  const { data, error } = await supabase
    .from('restaurant_settings')
    .insert(settings)
    .select()
    .single();
  if (error) throw new Error(error.message);
  
  // Invalidate cache
  await deleteCache('restaurantSettings');
  revalidateTag('restaurant-settings', 'default');
  return data;
}
