'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getRestaurantSettings } from '@/lib/actions';
import { getCached, setCache } from '@/lib/cache';
import Image from 'next/image';

interface LandingClientProps {
  initialSettings: any;
  initialFeatured: any[];
}

export default function LandingClient({ initialSettings, initialFeatured }: LandingClientProps) {
  const [settings, setSettings] = useState<any>(initialSettings);

  useEffect(() => {
    if (!initialSettings) {
      const cachedSettings = getCached<any>('settings');
      if (cachedSettings) {
        setSettings(cachedSettings);
      } else {
        getRestaurantSettings()
          .then(d => {
            setSettings(d);
            setCache('settings', d);
          })
          .catch(() => {});
      }
    }
  }, [initialSettings]);

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#1a1a2e] overflow-hidden">

      {/* Hero Section with Curves */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Curved background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top curve */}
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ height: '50vh' }}>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 0.08 }} />
                <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.12 }} />
                <stop offset="100%" style={{ stopColor: '#1D4ED8', stopOpacity: 0.06 }} />
              </linearGradient>
            </defs>
            <path d="M0,0 L0,200 Q360,350 720,250 Q1080,150 1440,300 L1440,0 Z" fill="url(#grad1)" />
            <path d="M0,50 Q360,200 720,120 Q1080,40 1440,180" stroke="#2563EB" strokeWidth="1" fill="none" opacity="0.15" />
            <path d="M0,80 Q360,230 720,150 Q1080,70 1440,210" stroke="#2563EB" strokeWidth="0.5" fill="none" opacity="0.1" />
          </svg>

          {/* Bottom curve */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ height: '50vh' }}>
            <defs>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#1D4ED8', stopOpacity: 0.05 }} />
                <stop offset="50%" style={{ stopColor: '#2563EB', stopOpacity: 0.08 }} />
                <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.04 }} />
              </linearGradient>
            </defs>
            <path d="M0,400 L0,200 Q360,50 720,150 Q1080,250 1440,100 L1440,400 Z" fill="url(#grad2)" />
            <path d="M0,350 Q360,200 720,280 Q1080,360 1440,220" stroke="#2563EB" strokeWidth="1" fill="none" opacity="0.1" />
          </svg>

          {/* Floating blue orbs */}
          <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-[#2563EB]/[0.07] blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-[#3B82F6]/[0.06] blur-[120px]" />
          <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-96 h-96 rounded-full bg-[#1D4ED8]/[0.05] blur-[150px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Logo with curved frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-6"
          >
            <div className="relative inline-block">
              {/* Curved ring behind logo */}
              <svg className="absolute inset-0 w-full h-full -m-4" viewBox="0 0 220 220">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.1 }} />
                  </linearGradient>
                </defs>
                <circle cx="110" cy="110" r="105" fill="none" stroke="url(#ringGrad)" strokeWidth="1" />
                <path d="M10 110 Q110 60 210 110" stroke="#2563EB" strokeWidth="0.5" fill="none" opacity="0.2" />
                <path d="M10 110 Q110 160 210 110" stroke="#2563EB" strokeWidth="0.5" fill="none" opacity="0.2" />
              </svg>

              <Image
                src="/dolphin-logo.png"
                alt="Dolphin Cafe & Restaurant"
                width={160}
                height={160}
                className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full shadow-[0_0_60px_rgba(37,99,235,0.2)]"
                priority
              />

              {/* Curved accent under logo */}
              <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2" width="140" height="12" viewBox="0 0 140 12">
                <path d="M5 6 Q70 14 135 6" stroke="#2563EB" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
              </svg>
            </div>
          </motion.div>

          {/* Restaurant Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
              <span className="text-[#1a1a2e]">Dolphin</span>{' '}
              <span className="text-[#2563EB]">Cafe</span>
            </h1>
            {/* Curved divider */}
            <svg className="mx-auto my-3" width="120" height="8" viewBox="0 0 120 8">
              <path d="M5 4 Q60 10 115 4" stroke="#2563EB" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
            </svg>
            <p className="text-[#1a1a2e]/50 text-base sm:text-lg tracking-wide font-light">
              {settings?.description || '& Restaurant'}
            </p>
          </motion.div>

          {/* Buttons with curved design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 mb-12"
          >
            <Link
              href="/menu"
              className="w-full sm:w-auto px-10 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.4)] hover:-translate-y-0.5"
            >
              View Menu <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settings?.address || 'Jossy Guest House | 02, 2RMH+P7H, Addis Ababa')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-4 border-2 border-[#2563EB]/20 text-[#2563EB] hover:bg-[#2563EB]/5 hover:border-[#2563EB]/40 font-medium text-base rounded-full transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Get Directions
            </a>
          </motion.div>

          {/* QR Code with curved container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-block"
          >
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(37,99,235,0.12)] border border-[#2563EB]/10 p-5">
              <QRCodeSVG
                value="https://dolphin-cafe-and-restaurant.vercel.app/menu"
                size={130}
                level="H"
                includeMargin
                fgColor="#1D4ED8"
                bgColor="#ffffff"
              />
            </div>
            <p className="mt-3 text-[#1a1a2e]/35 text-xs tracking-wider uppercase">Scan to view menu</p>
          </motion.div>

          {/* Contact with curved divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-10"
          >
            <svg className="mx-auto mb-4" width="200" height="2" viewBox="0 0 200 2">
              <path d="M0 1 Q50 0 100 1 Q150 2 200 1" stroke="#2563EB" strokeWidth="0.5" fill="none" opacity="0.2" />
            </svg>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <a
                href={`tel:${settings?.phone || '0911198890'}`}
                className="flex items-center gap-2 text-sm text-[#1a1a2e]/50 hover:text-[#2563EB] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                </div>
                {settings?.phone || '0911198890'}
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(settings?.address || 'Jossy Guest House | 02, 2RMH+P7H, Addis Ababa')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#1a1a2e]/50 hover:text-[#2563EB] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                </div>
                <span className="max-w-[200px] truncate">{settings?.address || 'Jossy Guest House | 02, 2RMH+P7H, Addis Ababa'}</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 border-2 border-[#2563EB]/20 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-[#2563EB]/50 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Map Section with Curved Top */}
      <section className="relative">
        {/* Curved transition */}
        <svg className="w-full -mt-1" viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block' }}>
          <path d="M0 80 Q720 0 1440 80 L1440 80 L0 80 Z" fill="#ffffff" />
        </svg>

        <div className="bg-white pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">Find Us</h2>
              <p className="text-sm text-[#1a1a2e]/40 flex items-center justify-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                {settings?.address || 'Jossy Guest House | 02, 2RMH+P7H, Addis Ababa'}
              </p>
            </div>
            <div className="w-full h-[300px] sm:h-[350px] overflow-hidden rounded-3xl border border-[#2563EB]/10 shadow-[0_10px_40px_rgba(37,99,235,0.08)]">
              <iframe
                src="https://www.google.com/maps?q=Jossy+Guest+House+02+2RMH%2B7H+Addis+Ababa&output=embed"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Dolphin Cafe & Restaurant location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Curved Top */}
      <footer className="relative">
        <svg className="w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block' }}>
          <path d="M0 60 Q360 0 720 30 Q1080 60 1440 10 L1440 60 L0 60 Z" fill="#f0f4ff" />
        </svg>
        <div className="bg-[#f0f4ff] px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
              <Image src="/dolphin-logo.png" alt="Dolphin" width={24} height={24} className="rounded-full" />
            <span className="text-sm font-semibold text-[#1a1a2e]/70">Dolphin Cafe & Restaurant</span>
          </div>
          <p className="text-xs text-[#1a1a2e]/30">&copy; {new Date().getFullYear()} Dolphin Cafe and Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
