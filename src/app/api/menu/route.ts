import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id,name,description,price,category,available,rating,created_at')
      .order('id');

    if (error) {
      console.error('[api/menu] Supabase error:', error);
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    const items = (data || []).map((item: any) => ({
      ...item,
      available: true,
      image: `/api/menu/image/${item.id}`,
    }));

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    });
  } catch (e) {
    console.error('[api/menu] Route failed:', e);
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  }
}
