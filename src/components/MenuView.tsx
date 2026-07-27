'use client';

import { ShoppingBag, Plus, Search, Phone, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getRestaurantSettings, createOrder } from '@/lib/actions';
import { getCached, setCache } from '@/lib/cache';
import { QRCodeSVG } from 'qrcode.react';

const FoodModal = lazy(() => import('@/components/FoodModal').then(m => ({ default: m.FoodModal })));
const Cart = lazy(() => import('@/components/Cart').then(m => ({ default: m.Cart })));
const ThemeToggle = lazy(() => import('@/components/ThemeToggle').then(m => ({ default: m.ThemeToggle })));

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  image: string;
}

interface MenuViewProps {
  tableNumber?: string;
  initialMenuItems?: any[];
  initialSettings?: any;
  initialCategory?: string;
}

export function MenuView({
  tableNumber,
  initialMenuItems = [],
  initialSettings = null,
  initialCategory = ''
}: MenuViewProps) {
  const searchParams = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<any[] | null>(initialMenuItems.length > 0 ? initialMenuItems : null);
  const [settings, setSettings] = useState<any>(initialSettings);
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || (initialMenuItems.length > 0 ? initialMenuItems[0].category : '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const refreshMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMenuItems(data);
        setCache('menuItems', data);
      } else {
        setMenuItems((prev) => (prev === null ? [] : prev));
      }
    } catch (e) {
      console.error('[MenuView] refreshMenu failed:', e);
      setMenuItems((prev) => (prev === null ? [] : prev));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl);
    } else if (initialCategory) {
      setActiveCategory(initialCategory);
    }

    if (!initialMenuItems || initialMenuItems.length === 0) {
      const cached = getCached<any[]>('menuItems');
      if (cached && cached.length > 0) {
        setMenuItems(cached);
      } else {
        refreshMenu();
      }
    }
  }, [searchParams, initialMenuItems, initialCategory]);

  useEffect(() => {
    if (!initialSettings) {
      getRestaurantSettings().then(setSettings).catch(() => {});
    }
  }, [initialSettings]);

  const filteredItems = useMemo(() => (menuItems ?? []).filter(item => {
    const q = searchQuery.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
  }), [menuItems, searchQuery]);
  const groupedItems: Record<string, any[]> = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.category]) groupedItems[item.category] = [];
    groupedItems[item.category].push(item);
  });
  const categoryNames = Object.keys(groupedItems);

  useEffect(() => {
    if (categoryNames.length > 0 && !activeCategory) {
      setActiveCategory(categoryNames[0]);
    }
  }, [categoryNames, activeCategory]);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToCart = (item: any, quantity: number, customizations: string[]) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
      ));
    } else {
      setCartItems([...cartItems, {
        id: item.id, name: item.name, price: item.price, quantity, customizations, image: item.image,
      }]);
    }
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) handleRemoveItem(id);
    else setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    try {
      await createOrder({
        customer: `Table ${tableNumber || 'Takeaway'}`,
        table_number: tableNumber || '0',
        items: cartItems.map(item => ({
          id: item.id, name: item.name, price: item.price, quantity: item.quantity, customizations: item.customizations,
        })),
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: 'confirmed',
        notes: '',
      });
      setCartItems([]);
      setIsCartOpen(false);
      alert('Order placed successfully!');
    } catch (e) {
      alert('Failed to place order: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setCheckingOut(false);
    }
  };

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    document.getElementById(`cat-${category}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-white dark:from-[#050508] dark:to-[#0a0a12] text-black dark:text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#2563EB]/3 dark:bg-[#2563EB]/5 blur-[150px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#2563EB]/2 dark:bg-[#2563EB]/3 blur-[150px]" />
      </div>

      <div className="relative">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#050508]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/[0.04]">
          <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="shrink-0">
                <Image src={settings?.logo || '/dolphin-logo.png'} alt="Logo" width={56} height={56} className="object-contain" priority />
              </Link>
              <span className="text-sm font-medium text-black/50 dark:text-white/50">
                {tableNumber ? `Table ${tableNumber}` : 'Our Menu'}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Suspense fallback={<div className="h-9 w-9" />}>
                <ThemeToggle />
              </Suspense>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm transition hover:border-[#2563EB]/40 hover:shadow-[#2563EB]/10 active:scale-95"
                aria-label="Cart"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white shadow-lg shadow-[#2563EB]/30">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="relative px-4 pb-8 pt-8 text-center">
          <div className="mx-auto max-w-7xl">
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-[#2563EB]/30 to-transparent mb-6">
              <Image src={settings?.logo || '/dolphin-logo.png'} alt="Logo" width={80} height={80} className="drop-shadow-2xl" priority />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black dark:text-white">
              {settings?.name || 'Dolphin Cafe and Restaurant'}
            </h1>
            {settings?.description && (
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.3em] text-[#2563EB]/70">
                {settings.description}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-5">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[#2563EB]/20 to-transparent opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-black/30 dark:text-white/30 group-focus-within:text-[#2563EB] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:border-[#2563EB]/50 transition-all"
              />
            </div>
          </div>
        </div>

        <nav className="sticky top-[60px] z-30 mx-auto max-w-7xl overflow-x-auto px-4 py-3 bg-gradient-to-b from-white dark:from-[#050508] to-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max items-center gap-2 p-1 rounded-2xl bg-black/5 dark:bg-white/[0.04]">
            {categoryNames.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => scrollToCategory(cat)}
                className={`relative whitespace-nowrap px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  activeCategory === cat
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25'
                    : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-2">
          {menuItems === null && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 py-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/[0.06] p-1.5 sm:p-2 flex gap-2">
                  <div className="w-[8rem] h-[8rem] rounded-xl bg-white/[0.06] shrink-0" />
                  <div className="flex-1 p-2 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
                    <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                    <div className="h-5 w-1/3 rounded bg-white/[0.06] mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {menuItems !== null && filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/40 text-sm">No items match your search</p>
            </div>
          )}
          {categoryNames.map((cat, ci) => (
            <section
              key={cat}
              id={`cat-${cat}`}
              className="scroll-mt-[120px] pt-6 sm:scroll-mt-[124px]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-[#2563EB]/40 to-transparent" />
                <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white tracking-tight">{cat}</h2>
                <div className="h-px flex-1 bg-gradient-to-l from-[#2563EB]/40 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupedItems[cat].map((item, ii) => (
                  <div
                    key={item.id}
                    className="group relative flex items-stretch gap-2 rounded-2xl bg-white dark:bg-neutral-900/50 border border-black/5 dark:border-white/[0.06] p-1.5 sm:p-2 hover:border-[#2563EB]/30 hover:shadow-lg hover:shadow-[#2563EB]/5 dark:hover:shadow-[#2563EB]/5 transition-all duration-300"
                  >
                    <div className="relative h-full max-h-[140px] min-h-[8rem] w-[8rem] shrink-0 overflow-hidden rounded-xl sm:max-h-[10rem] sm:w-[10rem]">
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className="h-full w-full cursor-zoom-in"
                      >
                        <div className="h-full w-full relative">
                          {item.image?.match(/^data:/) ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : item.image?.match(/^https?:/) ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                              loading={ci === 0 && ii < 6 ? 'eager' : 'lazy'}
                              decoding="async"
                            />
                          ) : item.image?.match(/^\/api\//) ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                              loading={ci === 0 && ii < 6 ? 'eager' : 'lazy'}
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/5 text-4xl">
                              {item.image}
                            </div>
                          )}
                        </div>
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-y-1 px-1.5 py-1.5">
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className="text-left text-sm font-semibold leading-snug text-pretty sm:text-lg group-hover:text-[#2563EB] transition-colors"
                      >
                        {item.name}
                      </button>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-bold sm:text-lg bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
                          Br. {item.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item, 1, []);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-all active:scale-90 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] text-white hover:shadow-lg hover:shadow-[#2563EB]/30"
                          aria-label={`Add ${item.name} to order`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-2 text-center text-2xl font-bold text-black dark:text-white">Find Us</h2>
          <p className="mb-6 text-center text-sm text-black/60 dark:text-white/60">
            Jossy Guest House | 02, 2RMH+P7H, Addis Ababa
          </p>
          <div className="mx-auto aspect-[21/9] w-full max-w-4xl overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
            <iframe
              src="https://www.google.com/maps?q=Jossy+Guest+House+02+2RMH%2B7H+Addis+Ababa&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Jossy Guest House | 02, 2RMH+P7H, Addis Ababa location"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center mb-10">
            <Image src={settings?.logo || '/dolphin-logo.png'} alt="Logo" width={80} height={80} className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black dark:text-white">{settings?.name || 'Dolphin Cafe and Restaurant'}</h3>
            {settings?.description && (
              <p className="text-sm text-black/50 dark:text-white/50 mt-1 max-w-md mx-auto">{settings.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            <div className="text-center md:text-left">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-black/60 dark:text-white/60">
                <a href={`tel:${settings?.phone || '0911198890'}`} className="flex items-center justify-center md:justify-start gap-3 hover:text-[#2563EB] transition-colors">
                  <Phone className="h-4 w-4 shrink-0" /> {settings?.phone || '0911198890'}
                </a>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(settings?.address || 'Jossy Guest House | 02, 2RMH+P7H, Addis Ababa')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 hover:text-[#2563EB] transition-colors">
                  <MapPin className="h-4 w-4 shrink-0" /> {settings?.address || 'Jossy Guest House | 02, 2RMH+P7H, Addis Ababa'}
                </a>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">Scan to Order</h4>
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 p-2 mx-auto">
                <QRCodeSVG value="https://dolphin-cafe-and-restaurant.vercel.app/" size={100} level="H" includeMargin fgColor="#1D4ED8" bgColor="#ffffff" className="w-full h-full" />
              </div>
            </div>

            <div className="text-center md:text-right">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">Follow Us</h4>
              <div className="flex items-center justify-center md:justify-end gap-3">
                <a href={(settings as any)?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-black/60 dark:text-white/60 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href={(settings as any)?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-black/60 dark:text-white/60 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href={(settings as any)?.telegram || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-black/60 dark:text-white/60 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
                <a href={(settings as any)?.tiktok || 'https://vt.tiktok.com/ZSXj8qdBa/'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-black/60 dark:text-white/60 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z"/></svg>
                </a>
                <a href={(settings as any)?.youtube || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-black/60 dark:text-white/60 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-black/60 dark:text-white/60 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10 text-center">
            <p className="text-xs text-black/60 dark:text-white/60">
              No service charge applies. Kindly note that prices are subject to 15% VAT.
            </p>
          </div>
        </div>
      </footer>

      {isModalOpen && selectedItem && (
        <Suspense fallback={null}>
          <FoodModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddToCart={handleAddToCart}
          />
        </Suspense>
      )}

      {isCartOpen && (
        <Suspense fallback={null}>
          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
        </Suspense>
      )}
    </div>
  );
}
