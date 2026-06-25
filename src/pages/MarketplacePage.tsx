import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, MessageCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MarketplaceListing, ListingCategory, ListingType } from '../types';
import { useAuth } from '../context/AuthContext';
import { LISTING_CATEGORY_LABELS, LISTING_TYPE_LABELS, timeAgo } from '../lib/helpers';

const listingTypeColors: Record<string, string> = {
  sell: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  free: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  lend: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
  swap: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ListingCategory | 'all'>('all');
  const [type, setType] = useState<ListingType | 'all'>('all');
  const [search, setSearch] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('marketplace_listings')
      .select('*, seller:profiles(*)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (category !== 'all') query = query.eq('category', category);
    if (type !== 'all') query = query.eq('listing_type', type);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data } = await query;
    setListings((data as MarketplaceListing[]) || []);
    setLoading(false);
  }, [category, type, search]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Marketplace</h1>
          <p className="text-sm text-gray-500 mt-0.5">Buy, sell, lend, and swap with neighbors</p>
        </div>
        {user && (
          <button onClick={() => navigate('/marketplace/new')} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Listing</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="input pl-10"
        />
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCategory('all')} className={`chip shrink-0 ${category === 'all' ? 'chip-active' : 'chip-inactive'}`}>All</button>
          {(Object.keys(LISTING_CATEGORY_LABELS) as ListingCategory[]).map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`chip shrink-0 ${category === c ? 'chip-active' : 'chip-inactive'}`}>
              {LISTING_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setType('all')} className={`chip ${type === 'all' ? 'chip-active' : 'chip-inactive'}`}>All Types</button>
          {(Object.keys(LISTING_TYPE_LABELS) as ListingType[]).map((t) => (
            <button key={t} onClick={() => setType(t)} className={`chip ${type === t ? 'chip-active' : 'chip-inactive'}`}>
              {LISTING_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No listings found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <article key={listing.id} className="card card-hover overflow-hidden group">
              {listing.image_url ? (
                <div className="h-40 overflow-hidden relative">
                  <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className={`absolute top-2 left-2 badge ${listingTypeColors[listing.listing_type]}`}>
                    {LISTING_TYPE_LABELS[listing.listing_type]}
                  </span>
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center relative">
                  <ShoppingBag className="w-12 h-12 text-violet-300" />
                  <span className={`absolute top-2 left-2 badge ${listingTypeColors[listing.listing_type]}`}>
                    {LISTING_TYPE_LABELS[listing.listing_type]}
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {LISTING_CATEGORY_LABELS[listing.category]}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(listing.created_at)}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{listing.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{listing.description}</p>
                <div className="flex items-center justify-between mb-3">
                  {listing.is_free ? (
                    <span className="font-bold text-primary-600">FREE</span>
                  ) : (
                    <span className="font-bold text-lg">${listing.price}</span>
                  )}
                  {listing.location && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {listing.location}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                  <img
                    src={listing.seller?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.seller?.name}`}
                    alt={listing.seller?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-xs text-gray-500 flex-1 truncate">{listing.seller?.name}</span>
                  <button className="btn-ghost p-1.5 text-xs">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
