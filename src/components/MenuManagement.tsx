'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Upload, X, Sparkles, ChevronDown, Grid3X3, List, Package } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { uploadImageToStorage } from '@/lib/supabase';

interface FoodItem {
  id: number; name: string; description: string; price: number;
  category: string; image: string; available: boolean;
}

interface MenuManagementProps {
  items: FoodItem[];
  onAdd: (item: Omit<FoodItem, 'id'>) => void;
  onEdit: (id: number, item: Partial<FoodItem>) => void;
  onDelete: (id: number) => void;
}

export function MenuManagement({ items, onAdd, onEdit, onDelete }: MenuManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [uploadedImage, setUploadedImage] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Resize image before upload
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP for better compression
        canvas.toBlob(async (blob) => {
          if (blob) {
            // Upload to Supabase Storage
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' });
            const uploadedUrl = await uploadImageToStorage(webpFile, file.name);
            
            if (uploadedUrl) {
              setUploadedImage(uploadedUrl);
            } else {
              // Fallback to data URL if upload fails
              const reader = new FileReader();
              reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
              reader.readAsDataURL(blob);
            }
          }
        }, 'image/webp', 0.85);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const categories = useMemo(() => ['all', ...Array.from(new Set(items.map(i => i.category)))], [items]);

  const filteredItems = useMemo(() => items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) &&
      (selectedCategory === 'all' || item.category === selectedCategory);
  }), [items, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Menu Management</h1>
            <p className="text-xs text-white/40">{items.length} items across {categories.length - 1} categories</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2563EB]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#2563EB] transition-colors z-10" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 focus:bg-white/[0.06] transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#2563EB]/50 transition-all cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-[#0a0a12] text-white">{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
          <div className="flex bg-white/[0.04] rounded-xl border border-white/[0.08] p-1">
            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-[#2563EB]/20 text-[#2563EB]' : 'text-white/30 hover:text-white/60')}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-[#2563EB]/20 text-[#2563EB]' : 'text-white/30 hover:text-white/60')}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingItem(null); setUploadedImage(''); setIsModalOpen(true); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#2563EB]/20"
          >
            <Plus className="w-4 h-4" />
            New Item
          </motion.button>
        </div>
      </div>

      {/* Items Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden hover:border-white/[0.12] transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  {item.image?.match(/^(https?:|data:|\/api\/)/) ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" fetchPriority="low" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-amber-600/5 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-amber-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">Unavailable</span>
                    </div>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingItem(item); setUploadedImage(''); setIsModalOpen(true); }}
                      className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-[#2563EB]/30 transition-all border border-white/[0.08]">
                      <Edit className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={() => onDelete(item.id)}
                      className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/30 transition-all border border-white/[0.08]">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                  {/* Category badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-medium text-white/60 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/[0.06]">
                      {item.category}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
                    <span className="text-sm font-bold text-[#2563EB] shrink-0">ETB {item.price}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-white/40 line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full',
                      item.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    )}>
                      {item.available ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] text-xs text-white/40 font-medium uppercase tracking-wider">
            <div className="col-span-4">Item</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <AnimatePresence>
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.04] shrink-0">
                  {item.image?.match(/^(https?:|data:|\/api\/)/) ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    {item.description && <p className="text-xs text-white/30 truncate max-w-[200px]">{item.description}</p>}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-white/50">{item.category}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-[#2563EB]">ETB {item.price}</span>
                </div>
                <div className="col-span-2">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    item.available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  )}>
                    {item.available ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <button onClick={() => { setEditingItem(item); setUploadedImage(''); setIsModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-[#2563EB] transition-all">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No items match your search</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0a0a12] to-[#050508] shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                      {editingItem ? <Edit className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                    </div>
                    <h2 className="text-lg font-bold text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.target as HTMLFormElement);
                  const name = data.get('name') as string;
                  const description = data.get('description') as string;
                  const price = parseFloat(data.get('price') as string);
                  const category = data.get('category') as string;
                  const url = data.get('image') as string;
                  const available = data.get('available') === 'on';
                  const image = url || uploadedImage;
                  if (editingItem) {
                    const payload: Record<string, unknown> = { name, description, price, category, available };
                    if (image) payload.image = image;
                    onEdit(editingItem.id, payload);
                  } else {
                    if (!image) { alert('Please provide an image URL or upload one.'); return; }
                    onAdd({ name, description, price, category, image, available } as Omit<FoodItem, 'id'>);
                  }
                  setIsModalOpen(false);
                  setUploadedImage('');
                }}>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Item Name</label>
                    <input type="text" name="name" defaultValue={editingItem?.name}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                      placeholder="Enter item name" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea name="description" defaultValue={editingItem?.description} rows={3}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all resize-none"
                      placeholder="Describe the dish..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Price (ETB)</label>
                      <input type="number" name="price" step="0.01" defaultValue={editingItem?.price}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                        placeholder="0.00" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Category</label>
                      <input type="text" name="category" list="category-list" defaultValue={editingItem?.category}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                        placeholder="Enter category" required />
                      <datalist id="category-list">
                        {Array.from(new Set(items.map(i => i.category))).map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Image URL <span className="font-normal normal-case text-white/20">or upload</span></label>
                    <input type="text" name="image" inputMode="url" defaultValue={editingItem?.image?.match(/^(https?|data):/) ? editingItem.image : ''}
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                      placeholder="https://images.unsplash.com/photo-..." />
                  </div>
                  <div>
                    <div onClick={() => fileInputRef.current?.click()}
                      className="relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/[0.08] rounded-xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#2563EB]/40 transition-all cursor-pointer group"
                    >
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                      {uploadedImage ? (
                        <div className="relative w-full h-full group">
                          <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain p-2" loading="lazy" decoding="async" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); setUploadedImage(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute top-2 right-2 px-2 py-1 bg-red-500/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <Upload className="w-6 h-6 text-white/20 group-hover:text-[#2563EB]/60 transition-colors" />
                          <span className="text-xs text-white/30">Click to upload image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="available" id="available" defaultChecked={editingItem?.available ?? true}
                      className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.04] text-[#2563EB] focus:ring-[#2563EB]/50" />
                    <span className="text-sm text-white/70">Available for ordering</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.04] transition-all">
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all">
                      {editingItem ? 'Update' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
