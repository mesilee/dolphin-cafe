'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  image: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50"
          >
            <GlassCard className="h-full rounded-none border-r border-[#2563EB]/20">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#2563EB]/20">
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="w-6 h-6 text-[#2563EB]" />
                    <h2 className="text-2xl font-bold text-black dark:text-white">
                      Your Cart
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                  >
                    <X className="w-6 h-6 text-black dark:text-white" />
                  </motion.button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <ShoppingBag className="w-16 h-16 text-[#2563EB]/30 mb-4" />
                      <p className="text-black/60 dark:text-white/60 text-lg">
                        Your cart is empty
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-[#2563EB]/10"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/5 rounded-lg flex items-center justify-center overflow-hidden">
                              {item.image?.match(/^(https?:|data:|\/api\/)/) ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              ) : (
                                <span className="text-3xl">{item.image}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-black dark:text-white mb-1">
                                {item.name}
                              </h3>
                              {item.customizations.length > 0 && (
                                <p className="text-xs text-black/50 dark:text-white/50 mb-2">
                                  {item.customizations.join(', ')}
                                </p>
                              )}
                              <p className="text-[#2563EB] font-bold">ETB {item.price}</p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-end mt-4 space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 border border-[#2563EB]/30 rounded-full flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4 text-black dark:text-white" />
                            </motion.button>
                            <span className="text-black dark:text-white font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 border border-[#2563EB]/30 rounded-full flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4 text-black dark:text-white" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className="p-6 border-t border-[#2563EB]/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-black dark:text-white">Subtotal</span>
                      <span className="text-black dark:text-white font-bold">ETB {total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black dark:text-white">Service Charge (10%)</span>
                      <span className="text-black dark:text-white font-bold">ETB {total * 0.1}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-black dark:text-white font-bold">Total</span>
                      <span className="text-[#2563EB] font-bold">ETB {total * 1.1}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onCheckout}
                      className="w-full py-4 bg-[#2563EB] text-white rounded-full font-bold text-lg hover:bg-[#1D4ED8] transition-colors"
                    >
                      Proceed to Checkout
                    </motion.button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}