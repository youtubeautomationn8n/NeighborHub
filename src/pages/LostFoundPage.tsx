import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Calendar, CheckCircle2, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LostFoundItem, LostFoundType, LostFoundStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../lib/helpers';

const statusColors: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  recovered: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  claimed: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  recovered: 'Recovered',
  claimed: 'Claimed',
};

export default function LostFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<LostFoundType>('lost');
  const [statusFilter, setStatusFilter] = useState<LostFoundStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('lost_found_items')
      .select('*, author:profiles(*)')
      .eq('type', tab)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (search) query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%`);

    const { data } = await query;
    setItems((data as LostFoundItem[]) || []);
    setLoading(false);
  }, [tab, statusFilter, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Lost & Found</h1>
          <p className="text-sm text-gray-500 mt-0.5">Help reunite lost items with their owners</p>
        </div>
        {user && (
          <button onClick={() => navigate('/lost-found/new')} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Post Item</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 w-fit">
        <button
          onClick={() => setTab('lost')}
          className={`btn py-2 ${tab === 'lost' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          <Search className="w-4 h-4" /> Lost
        </button>
        <button
          onClick={() => setTab('found')}
          className={`btn py-2 ${tab === 'found' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          <CheckCircle2 className="w-4 h-4" /> Found
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'recovered', 'claimed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`chip capitalize ${statusFilter === s ? 'chip-active' : 'chip-inactive'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No {tab} items found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <article key={item.id} className="card card-hover overflow-hidden">
              {item.image_url ? (
                <div className="h-40 overflow-hidden">
                  <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
                  <Search className="w-12 h-12 text-amber-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${statusColors[item.status]}`}>{statusLabels[item.status]}</span>
                  <span className="text-xs text-gray-500">{timeAgo(item.created_at)}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.item_name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  {item.last_seen_location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {item.last_seen_location}
                    </div>
                  )}
                  {item.last_seen_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {item.last_seen_date}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                  <img
                    src={item.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.author?.name}`}
                    alt={item.author?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-xs text-gray-500 flex-1 truncate">by {item.author?.name}</span>
                  {item.contact_method && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Contact
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
