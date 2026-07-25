'use server';

import { cookies } from 'next/headers';
import { supabase } from './supabase';

const WAITER_EMAIL = process.env.WAITER_EMAIL || 'waiter@dolphincafe.com';
const WAITER_PASSWORD = process.env.WAITER_PASSWORD || 'waiter123';

export async function verifyWaiter(email: string, password: string) {
  if (email !== WAITER_EMAIL || password !== WAITER_PASSWORD) {
    return { success: false, error: 'Invalid email or password' };
  }

  const cookieStore = await cookies();
  cookieStore.set('waiter_session', JSON.stringify({ name: 'Waiter', email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  return { success: true, name: 'Waiter' };
}

export async function logoutWaiter() {
  const cookieStore = await cookies();
  cookieStore.delete('waiter_session');
}

export async function checkWaiterAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('waiter_session')?.value;
  if (!session) return null;
  try { return JSON.parse(session); } catch { return null; }
}
