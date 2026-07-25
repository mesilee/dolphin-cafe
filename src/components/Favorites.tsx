'use client';

import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Heart, Star, Trash2 } from 'lucide-react';

interface FavoriteItem {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

interface FavoritesProps {
  items: FavoriteItem[];
  onRemove: (id: number) => void;
  onAddToCart: (item: FavoriteItem) => void;
}

export function Favorites({ items, onRemove, onAddToCart }: FavoritesProps) {
  if (items.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <Heart className="w-16 h-16 text-[#2563EB]/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-black dark:text-white mb-2">
          No favorites yet
        </h3>
        <p className="text-black/60 dark:text-white/60">
          Start adding your favorite dishes to see them here
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassCard className="overflow-hidden h-full">
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/5 flex items-center justify-center overflow-hidden">
                {item.image?.match(/^(https?:|data:|\/api\/)/) ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <span className="text-6xl">{item.image}</span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(item.id)}
                className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </motion.button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-black dark:text-white">
                  {item.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" />
                  <span className="text-sm font-medium text-black dark:text-white">
                    {item.rating}
                  </span>
                </div>
              </div>
              
              <p className="text-black/60 dark:text-white/60 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#2563EB]">
                  ETB {item.price}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddToCart(item)}
                  className="px-6 py-2 bg-[#2563EB] text-white rounded-full font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}