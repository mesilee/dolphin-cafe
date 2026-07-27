'use server';

import { supabase } from './supabase';
import { revalidateTag } from 'next/cache';
import { FALLBACK_MENU } from './menu-data';

function getFallbackMenu() {
  return FALLBACK_MENU.map((item: any) => ({
    ...item,
    available: true,
    rating: item.rating || 4.5,
    created_at: new Date().toISOString(),
  }));
}

export async function getMenuItems(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id,name,description,price,category,available,rating,created_at')
      .order('id');
    if (error) {
      console.error('[actions] Supabase query error:', error);
      return getFallbackMenu();
    }
    if (!data || data.length === 0) {
      console.warn('[actions] Supabase returned 0 items, using fallback');
      return getFallbackMenu();
    }
    return data.map((item: any) => ({
      ...item,
      available: true,
      image: `/api/menu/image/${item.id}`,
    }));
  } catch (e) {
    console.error('[actions] getMenuItems failed:', e);
    return getFallbackMenu();
  }
}

export async function getMenuItemImage(id: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('image')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data.image;
  } catch {
    return null;
  }
}

export async function getMenuImages(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id,image')
      .order('id');
    if (error) {
      console.error('[actions] Supabase query error (images):', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('[actions] getMenuImages failed:', e);
    return [];
  }
}

export async function seedMenuItems(items: Record<string, unknown>[]) {
  try {
    const { data, error } = await supabase.from('menu_items').upsert(items, { onConflict: 'id' }).select();
    if (error) return { success: false, error: error.message };
    try { revalidateTag('menu', 'default'); } catch {}
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function addMenuItem(item: Record<string, unknown>) {
  try {
    const { data, error } = await supabase.from('menu_items').insert(item).select();
    if (error) return { success: false, error: error.message };
    try { revalidateTag('menu', 'default'); } catch {}
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
      try { revalidateTag('menu', 'default'); } catch {}
      return { success: true, data: inserted?.[0] || inserted };
    }
    try { revalidateTag('menu', 'default'); } catch {}
    return { success: true, data: data[0] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteMenuItem(id: number) {
  try {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    try { revalidateTag('menu', 'default'); } catch {}
  } catch (e) {
    throw e;
  }
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
export async function getRestaurantSettings() {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('id,name,description,address,phone,email,website,opening_hours_weekdays,opening_hours_weekends,logo,cover_image,instagram,telegram,tiktok,youtube,facebook')
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  } catch (e) {
    console.error('[actions] getRestaurantSettings failed:', e);
    return null;
  }
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
    try { revalidateTag('restaurant-settings', 'default'); } catch {}
    return data;
  }
  const { data, error } = await supabase
    .from('restaurant_settings')
    .insert(settings)
    .select()
    .single();
  if (error) throw new Error(error.message);
  try { revalidateTag('restaurant-settings', 'default'); } catch {}
  return data;
}
