'use client';

import { motion } from 'framer-motion';
import { Save, MapPin, Phone, Mail, Clock, Globe, Image as ImageIcon, Settings, Camera, MessageCircle, Play } from 'lucide-react';
import { useState } from 'react';

interface RestaurantSettingsProps {
  settings: {
    name: string; description: string; address: string; phone: string; email: string; website: string;
    openingHours: { weekdays: string; weekends: string; };
    logo: string; coverImage: string;
    instagram?: string; telegram?: string; tiktok?: string; youtube?: string; facebook?: string;
  };
  onSave: (settings: any) => void;
}

export function RestaurantSettings({ settings, onSave }: RestaurantSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (field: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, child: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [parent]: { ...(prev as any)[parent], [child]: value } }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-white/40">Manage restaurant preferences</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Basic Information</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Restaurant Name</label>
            <input type="text" value={localSettings.name} onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={localSettings.description} onChange={(e) => handleChange('description', e.target.value)} rows={4}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Contact Information</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={localSettings.address} onChange={(e) => handleChange('address', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="tel" value={localSettings.phone} onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={localSettings.email} onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Website</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="url" value={localSettings.website} onChange={(e) => handleChange('website', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Opening Hours</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Weekdays</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={localSettings.openingHours.weekdays}
                onChange={(e) => handleNestedChange('openingHours', 'weekdays', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Weekends</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={localSettings.openingHours.weekends}
                onChange={(e) => handleNestedChange('openingHours', 'weekends', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Social Media Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Instagram</label>
            <div className="relative">
              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="url" value={(localSettings as any).instagram || ''} onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                placeholder="https://instagram.com/yourpage" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Telegram</label>
            <div className="relative">
              <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="url" value={(localSettings as any).telegram || ''} onChange={(e) => handleChange('telegram', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                placeholder="https://t.me/yourpage" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">TikTok</label>
              <div className="relative">
                <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="url" value={(localSettings as any).tiktok || ''} onChange={(e) => handleChange('tiktok', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                  placeholder="https://tiktok.com/@yourpage" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Facebook</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="url" value={(localSettings as any).facebook || ''} onChange={(e) => handleChange('facebook', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                  placeholder="https://facebook.com/yourpage" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">YouTube</label>
              <div className="relative">
                <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="url" value={(localSettings as any).youtube || ''} onChange={(e) => handleChange('youtube', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
                  placeholder="https://youtube.com/@yourpage" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Branding Images</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Logo URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="url" value={localSettings.logo} onChange={(e) => handleChange('logo', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Cover Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="url" value={localSettings.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => onSave(localSettings)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#2563EB]/20">
          <Save className="w-4 h-4" /> Save Changes
        </motion.button>
      </div>
    </div>
  );
}
