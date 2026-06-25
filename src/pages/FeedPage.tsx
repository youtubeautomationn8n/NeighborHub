import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Plus, TrendingUp, Clock, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Post, Category } from '../types';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { POST_TYPE_LABELS } from '../lib/helpers';

const sortOptions = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'nearby', label: 'Nearby', icon: MapPin },
];

export default function FeedPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(params.get('q') || '');
  const [sortBy, setSortBy] = useState(params.get('sort') || 'newest');
  const [selectedCategory, setSelectedCategory] = useState(params.get('category') || 'all');
  const [postType, setPostType] = useState(params.get('type') || 'all');
  const [urgency, setUrgency] = useState(params.get('urgency') || 'all');

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, author:profiles(*), category:categories(*)')
      .eq('hidden', false);

    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (postType !== 'all') query = query.eq('post_type', postType);
    if (urgency !== 'all') query = query.eq('urgency', urgency);

    const searchQ = params.get('q');
    if (searchQ) {
      query = query.or(`title.ilike.%${searchQ}%,description.ilike.%${searchQ}%`);
    }

    if (sortBy === 'trending') {
      query = query.order('likes_count', { ascending: false });
    } else if (sortBy === 'nearby') {
      query = query.order('pinned', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('pinned', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data } = await query.limit(50);
    setPosts((data as Post[]) || []);
    setLoading(false);
  }, [selectedCategory, postType, urgency, sortBy, params, categories]);

  useEffect(() => {
    if (categories.length > 0) fetchPosts();
  }, [fetchPosts, categories.length]);

  // Real-time: refresh posts when changes happen
  useEffect(() => {
    const channel = supabase
      .channel('feed-posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        if (categories.length > 0) fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts, categories.length]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params);
    if (value === 'all' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setParams(newParams);

    if (key === 'q') setSearch(value);
    if (key === 'sort') setSortBy(value);
    if (key === 'category') setSelectedCategory(value);
    if (key === 'type') setPostType(value);
    if (key === 'urgency') setUrgency(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('q', search);
  };

  const clearFilters = () => {
    setParams({});
    setSearch('');
    setSortBy('newest');
    setSelectedCategory('all');
    setPostType('all');
    setUrgency('all');
  };

  const hasActiveFilters = selectedCategory !== 'all' || postType !== 'all' || urgency !== 'all' || params.get('q');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Community Feed</h1>
          <p className="text-sm text-gray-500 mt-0.5">See what's happening in your neighborhood</p>
        </div>
        {user && (
          <button onClick={() => navigate('/post/new')} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Post</span>
          </button>
        )}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="input pl-10"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-outline shrink-0 ${showFilters ? 'border-primary-400 text-primary-600' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Sort chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {sortOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => updateFilter('sort', opt.value)}
              className={`chip shrink-0 ${sortBy === opt.value ? 'chip-active' : 'chip-inactive'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {opt.label}
            </button>
          );
        })}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 mb-4 animate-slide-down">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-error-500 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateFilter('category', 'all')} className={`chip text-xs ${selectedCategory === 'all' ? 'chip-active' : 'chip-inactive'}`}>All</button>
                {categories.map((cat) => (
                  <button key={cat.slug} onClick={() => updateFilter('category', cat.slug)} className={`chip text-xs ${selectedCategory === cat.slug ? 'chip-active' : 'chip-inactive'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Post Type</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateFilter('type', 'all')} className={`chip text-xs ${postType === 'all' ? 'chip-active' : 'chip-inactive'}`}>All</button>
                {Object.entries(POST_TYPE_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => updateFilter('type', key)} className={`chip text-xs ${postType === key ? 'chip-active' : 'chip-inactive'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Urgency</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'normal', 'low', 'medium', 'high'].map((u) => (
                  <button key={u} onClick={() => updateFilter('urgency', u)} className={`chip text-xs capitalize ${urgency === u ? 'chip-active' : 'chip-inactive'}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {params.get('q') && (
            <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              Search: "{params.get('q')}"
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400">
              {categories.find((c) => c.slug === selectedCategory)?.name}
            </span>
          )}
          {postType !== 'all' && (
            <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {POST_TYPE_LABELS[postType]}
            </span>
          )}
          {urgency !== 'all' && (
            <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 capitalize">
              {urgency} urgency
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-error-500 hover:underline">Clear</button>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-2">No posts found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or create a new post</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
