'use client';

import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  role?: 'client' | 'admin';
}

export function Navigation({ role = 'client' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = role === 'client' 
    ? [
        { name: 'Menu', href: '#menu' },
        { name: 'Orders', href: '#orders' },
        { name: 'Favorites', href: '#favorites' },
        { name: 'Reviews', href: '#reviews' },
      ]
    : [
        { name: 'Dashboard', href: '#dashboard' },
        { name: 'Orders', href: '#orders' },
        { name: 'Menu', href: '#menu' },
        { name: 'Tables', href: '#tables' },
        { name: 'Customers', href: '#customers' },
        { name: 'Settings', href: '#settings' },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-[#2563EB]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <img src="/dolphin-logo.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-black dark:text-white">
              {role === 'client' ? 'Dolphin Cafe and Restaurant' : 'ADMIN PANEL'}
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-black dark:text-white hover:text-[#2563EB] transition-colors duration-200 font-medium"
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {role === 'client' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-black dark:text-white hover:text-[#2563EB] transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2563EB] text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </motion.button>
            )}
            
            {role === 'admin' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-black dark:text-white hover:text-[#2563EB] transition-colors"
              >
                <Settings className="w-6 h-6" />
              </motion.button>
            )}

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-black dark:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-[#2563EB]/20"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-black dark:text-white hover:text-[#2563EB] transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}