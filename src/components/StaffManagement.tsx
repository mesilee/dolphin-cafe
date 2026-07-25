'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Shield, ChefHat, Users, Mail, Phone, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StaffMember {
  id: number; name: string; email: string; phone: string;
  role: 'admin' | 'manager' | 'chef' | 'waiter' | 'host'; status: 'active' | 'inactive'; joinDate: string;
}

interface StaffManagementProps {
  staff: StaffMember[];
  onAdd: (member: Omit<StaffMember, 'id'>) => void;
  onEdit: (id: number, member: Partial<StaffMember>) => void;
  onDelete: (id: number) => void;
}

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Shield },
  manager: { label: 'Manager', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Users },
  chef: { label: 'Chef', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: ChefHat },
  waiter: { label: 'Waiter', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Users },
  host: { label: 'Host', color: 'text-pink-400', bg: 'bg-pink-500/10', icon: Users },
};

export function StaffManagement({ staff, onAdd, onEdit, onDelete }: StaffManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | StaffMember['role']>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  const filteredStaff = staff.filter(m => {
    const q = searchQuery.toLowerCase();
    return (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) && (selectedRole === 'all' || m.role === selectedRole);
  });

  const roles: ('all' | StaffMember['role'])[] = ['all', 'admin', 'manager', 'chef', 'waiter', 'host'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Staff</h1>
            <p className="text-xs text-white/40">{staff.length} members</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#2563EB]/20">
          <Plus className="w-4 h-4" /> Add Staff
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-2">
        {roles.map((role) => {
          const active = selectedRole === role;
          const label = role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1);
          const count = role === 'all' ? staff.length : staff.filter(s => s.role === role).length;
          return (
            <button key={role} onClick={() => setSelectedRole(role)}
              className={cn('px-3.5 py-2 rounded-xl text-xs font-medium transition-all border',
                active ? 'border-[#2563EB]/40 bg-gradient-to-r from-[#2563EB]/15 to-transparent text-[#2563EB]' : 'border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
              )}>
              {label} <span className={cn('ml-1.5 px-1.5 py-0.5 rounded text-[10px]', active ? 'bg-[#2563EB]/20' : 'bg-white/[0.06]')}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#2563EB] transition-colors z-10" />
        <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="relative w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredStaff.map((member, i) => {
            const rc = roleConfig[member.role] || roleConfig.waiter;
            const RoleIcon = rc.icon;
            return (
              <motion.div key={member.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-5 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-400">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{member.name}</h3>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium', rc.bg, rc.color)}>
                        <RoleIcon className="w-3 h-3" /> {rc.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingMember(member); setIsModalOpen(true); }}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-[#2563EB] transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(member.id)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/50"><Mail className="w-3.5 h-3.5 text-white/30" />{member.email}</div>
                  <div className="flex items-center gap-2 text-white/50"><Phone className="w-3.5 h-3.5 text-white/30" />{member.phone}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className={cn('text-xs font-medium', member.status === 'active' ? 'text-emerald-400' : 'text-red-400')}>
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-white/30">Joined {member.joinDate}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-16"><Users className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-sm text-white/30">No staff found</p></div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0a0a12] to-[#050508] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editingMember ? 'Edit Staff' : 'Add Staff'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.target as HTMLFormElement);
                if (editingMember) onEdit(editingMember.id, { name: data.get('name') as string, email: data.get('email') as string, phone: data.get('phone') as string, role: data.get('role') as any, status: data.get('status') as any });
                else onAdd({ name: data.get('name') as string, email: data.get('email') as string, phone: data.get('phone') as string, role: data.get('role') as any, status: data.get('status') as any, joinDate: new Date().toISOString().split('T')[0] });
                setIsModalOpen(false);
              }}>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input type="text" name="name" defaultValue={editingMember?.name}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" name="email" defaultValue={editingMember?.email}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="tel" name="phone" defaultValue={editingMember?.phone}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Role</label>
                    <div className="relative">
                      <select name="role" defaultValue={editingMember?.role || 'waiter'}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-[#2563EB]/50 transition-all cursor-pointer">
                        <option value="admin" className="bg-[#0a0a12]">Admin</option>
                        <option value="manager" className="bg-[#0a0a12]">Manager</option>
                        <option value="chef" className="bg-[#0a0a12]">Chef</option>
                        <option value="waiter" className="bg-[#0a0a12]">Waiter</option>
                        <option value="host" className="bg-[#0a0a12]">Host</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Status</label>
                    <div className="relative">
                      <select name="status" defaultValue={editingMember?.status || 'active'}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-[#2563EB]/50 transition-all cursor-pointer">
                        <option value="active" className="bg-[#0a0a12]">Active</option>
                        <option value="inactive" className="bg-[#0a0a12]">Inactive</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.04] transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black font-semibold text-sm hover:brightness-110 transition-all">
                    {editingMember ? 'Update' : 'Add Staff'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
