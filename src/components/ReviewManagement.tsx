'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Trash2, Search, Reply, X, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Review {
  id: number; customer: string; rating: number; comment: string;
  date: string; status: 'pending' | 'approved' | 'rejected'; response?: string;
}

interface ReviewManagementProps {
  reviews: Review[];
  onUpdateStatus: (id: number, status: Review['status']) => void;
  onRespond: (id: number, response: string) => void;
  onDelete: (id: number) => void;
}

export function ReviewManagement({ reviews, onUpdateStatus, onRespond, onDelete }: ReviewManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | Review['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');

  const filteredReviews = reviews.filter(r => {
    const s = selectedStatus === 'all' || r.status === selectedStatus;
    const q = r.customer.toLowerCase().includes(searchQuery.toLowerCase()) || r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return s && q;
  });

  const statuses: ('all' | Review['status'])[] = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20 flex items-center justify-center">
          <Star className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Reviews</h1>
          <p className="text-xs text-white/40">{reviews.length} reviews • {reviews.filter(r => r.status === 'pending').length} pending</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const active = selectedStatus === status;
          const label = status === 'all' ? 'All Reviews' : status.charAt(0).toUpperCase() + status.slice(1);
          const count = status === 'all' ? reviews.length : reviews.filter(r => r.status === status).length;
          return (
            <button key={status} onClick={() => setSelectedStatus(status)}
              className={cn(
                'relative px-3.5 py-2 rounded-xl text-xs font-medium transition-all border',
                active ? 'border-[#2563EB]/40 bg-gradient-to-r from-[#2563EB]/15 to-transparent text-[#2563EB]' : 'border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
              )}>
              {label}
              <span className={cn('ml-2 px-1.5 py-0.5 rounded text-[10px]', active ? 'bg-[#2563EB]/20' : 'bg-white/[0.06]')}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#2563EB] transition-colors z-10" />
        <input type="text" placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="relative w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all" />
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredReviews.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-pink-400">{review.customer.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{review.customer}</p>
                    <p className="text-xs text-white/40">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-semibold border',
                    review.status === 'pending' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    review.status === 'approved' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    review.status === 'rejected' && 'bg-red-500/10 text-red-400 border-red-500/20',
                  )}>{review.status}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn('w-3.5 h-3.5', i < review.rating ? 'text-[#2563EB] fill-[#2563EB]' : 'text-white/20')} />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/70 mb-4">{review.comment}</p>

              {review.response && (
                <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-2 border-l-[#2563EB]">
                  <p className="text-xs text-white/50"><span className="font-semibold text-white/70">Response:</span> {review.response}</p>
                </div>
              )}

              {respondingTo === review.id && (
                <div className="mb-4 space-y-3">
                  <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all resize-none"
                    placeholder="Write your response..." />
                  <div className="flex gap-2">
                    <button onClick={() => { if (responseText.trim()) onRespond(review.id, responseText); setRespondingTo(null); setResponseText(''); }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-black text-xs font-semibold hover:brightness-110 transition-all">Send</button>
                    <button onClick={() => { setRespondingTo(null); setResponseText(''); }}
                      className="px-4 py-2 rounded-xl border border-white/[0.08] text-white/50 text-xs hover:bg-white/[0.04] transition-all">Cancel</button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <div className="flex gap-2">
                  {review.status === 'pending' && (
                    <>
                      <button onClick={() => onUpdateStatus(review.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => onUpdateStatus(review.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1.5">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  {!review.response && (
                    <button onClick={() => setRespondingTo(review.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/50 text-xs font-medium border border-white/[0.08] hover:bg-white/[0.1] transition-all flex items-center gap-1.5">
                      <Reply className="w-3 h-3" /> Respond
                    </button>
                  )}
                </div>
                <button onClick={() => onDelete(review.id)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No reviews found</p>
        </div>
      )}
    </div>
  );
}
