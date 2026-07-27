import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _initAttempted = false;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  if (_initAttempted) return null;
  _initAttempted = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn('[supabase] env vars not set — Supabase disabled');
    return null;
  }
  _supabase = createClient(url, key);
  return _supabase;
}

function createNoopProxy(): SupabaseClient {
  const resolved = { data: null, error: { message: 'Supabase not configured', code: 'CONFIG_MISSING' }, count: null, status: 0, statusText: 'Not Configured' };
  const chainable: any = new Proxy({}, {
    get(_, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'single') return () => Promise.resolve(resolved);
      if (prop === 'eq') return () => chainable;
      if (prop === 'neq') return () => chainable;
      if (prop === 'gt') return () => chainable;
      if (prop === 'lt') return () => chainable;
      if (prop === 'gte') return () => chainable;
      if (prop === 'lte') return () => chainable;
      if (prop === 'in') return () => chainable;
      if (prop === 'contains') return () => chainable;
      if (prop === 'order') return () => chainable;
      if (prop === 'limit') return () => chainable;
      if (prop === 'range') return () => chainable;
      if (prop === 'select') return () => chainable;
      if (prop === 'insert') return () => chainable;
      if (prop === 'update') return () => chainable;
      if (prop === 'upsert') return () => chainable;
      if (prop === 'delete') return () => chainable;
      if (prop === 'storage') return new Proxy({}, { get: () => chainable });
      return chainable;
    },
  });

  return new Proxy({} as SupabaseClient, {
    get(_, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'from') return () => chainable;
      if (prop === 'storage') return new Proxy({}, { get: () => chainable });
      return chainable;
    },
  }) as SupabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) {
      return (createNoopProxy() as any)[prop];
    }
    return (client as any)[prop];
  },
});

export async function uploadImageToStorage(file: File, fileName: string): Promise<string | null> {
  try {
    const client = getSupabase();
    if (!client) {
      console.error('Supabase client not initialized');
      return null;
    }

    const { data, error } = await client.storage
      .from('menu-images')
      .upload(`${fileName}-${Date.now()}`, file, {
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = client.storage
      .from('menu-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}
