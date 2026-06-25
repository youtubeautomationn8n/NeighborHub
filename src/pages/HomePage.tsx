import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Megaphone, Calendar, Search, Heart, ShoppingBag, ThumbsUp, Store, FileText,
  ArrowRight, TrendingUp, AlertTriangle, Users, Plus, Upload, Flag, BadgeCheck,
  Sparkles, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Post, EventItem, Alert, Profile } from '../types';
import PostCard from '../components/PostCard';
import EventCard from '../components/EventCard';
import { ALERT_TYPE_LABELS, ALERT_SEVERITY_COLORS } from '../lib/helpers';
import { useAuth } from '../context/AuthContext';

const categories = [
  { slug: 'announcements', label: 'Announcements', icon: Megaphone, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  { slug: 'events', label: 'Events', icon: Calendar, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  { slug: 'lost-found', label: 'Lost & Found', icon: Search, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
  { slug: 'help', label: 'Help Requests', icon: Heart, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400' },
  { slug: 'buy-sell', label: 'Buy & Sell', icon: ShoppingBag, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
  { slug: 'recommendations', label: 'Recommendations', icon: ThumbsUp, color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400' },
  { slug: 'businesses', label: 'Local Businesses', icon: Store, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400' },
  { slug: 'files', label: 'Documents', icon: FileText, color: 'from-slate-500 to-gray-600', bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [featuredNeighbors, setFeaturedNeighbors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const [posts, events, alerts, neighbors] = await Promise.all([
        supabase
          .from('posts')
          .select('*, author:profiles(*), category:categories(*)')
          .eq('hidden', false)
          .order('likes_count', { ascending: false })
          .limit(4)
          .then(({ data }) => data as Post[] | null),
        supabase
          .from('events')
          .select('*, organizer:profiles(*)')
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date', { ascending: true })
          .limit(3)
          .then(({ data }) => data as EventItem[] | null),
        supabase
          .from('alerts')
          .select('*, author:profiles(*)')
          .eq('active', true)
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3)
          .then(({ data }) => data as Alert[] | null),
        supabase
          .from('profiles')
          .select('*')
          .order('trust_score', { ascending: false })
          .limit(4)
          .then(({ data }) => data as Profile[] | null),
      ]);

      if (!mounted) return;
      setTrendingPosts(posts || []);
      setUpcomingEvents(events || []);
      setRecentAlerts(alerts || []);
      setFeaturedNeighbors(neighbors || []);
      setLoading(false);
    };

    loadData();

    // Real-time subscriptions for live updates
    const postsChannel = supabase
      .channel('home-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadData())
      .subscribe();

    const eventsChannel = supabase
      .channel('home-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadData())
      .subscribe();

    const alertsChannel = supabase
      .channel('home-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => loadData())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/feed?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200 dark:bg-primary-900/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-200 dark:bg-secondary-900/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              {user ? `Welcome back, ${user.email?.split('@')[0]}` : 'Your neighborhood, connected'}
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight mb-4 animate-slide-up">
              Everything happening in your <span className="text-primary-600">neighborhood</span>, all in one place.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 animate-slide-up">
              Share updates, organize events, find lost pets, ask for help, buy and sell, and discover trusted local information — without the noise of social media.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative max-w-xl mb-6 animate-slide-up">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts, events, lost items, services, files..."
                className="w-full pl-12 pr-28 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2">
                Search
              </button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 animate-slide-up">
              {!user && (
                <Link to="/auth?mode=signup" className="btn-primary">
                  <Users className="w-4 h-4" /> Join Community
                </Link>
              )}
              <Link to="/post/new" className="btn-secondary">
                <Plus className="w-4 h-4" /> Post Something
              </Link>
              <Link to="/files" className="btn-outline">
                <Upload className="w-4 h-4" /> Upload File
              </Link>
              <Link to="/alerts" className="btn-outline">
                <Flag className="w-4 h-4" /> Report an Issue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-display font-semibold text-xl mb-6">Explore Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to={cat.slug === 'announcements' || cat.slug === 'recommendations' ? `/feed?category=${cat.slug}` : `/${cat.slug}`}
                className="card card-hover p-5 group"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${cat.text}`} />
                </div>
                <h3 className="font-semibold text-sm">{cat.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Alerts Banner */}
      {recentAlerts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-error-500" />
            <h2 className="font-display font-semibold text-xl">Recent Alerts</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAlerts.map((alert) => (
              <Link key={alert.id} to="/alerts" className={`card card-hover p-4 border-l-4 ${ALERT_SEVERITY_COLORS[alert.severity]}`}>
                <div className="flex items-start justify-between mb-1">
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {ALERT_TYPE_LABELS[alert.alert_type]}
                  </span>
                  {alert.pinned && <span className="text-xs text-amber-600 font-medium">Pinned</span>}
                </div>
                <h3 className="font-semibold text-sm mb-1">{alert.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{alert.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending + Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trending Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <h2 className="font-display font-semibold text-xl">Trending Posts</h2>
              </div>
              <Link to="/feed" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
            ) : (
              <div className="space-y-4">
                {trendingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary-500" />
                <h2 className="font-display font-semibold text-xl">Upcoming Events</h2>
              </div>
              <Link to="/events" className="text-sm text-secondary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Neighbors */}
      {featuredNeighbors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <BadgeCheck className="w-5 h-5 text-secondary-500" />
            <h2 className="font-display font-semibold text-xl">Featured Neighbors & Helpers</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredNeighbors.map((neighbor) => (
              <Link key={neighbor.id} to={`/profile/${neighbor.id}`} className="card card-hover p-5 text-center group">
                <img
                  src={neighbor.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${neighbor.name}`}
                  alt={neighbor.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3 group-hover:scale-105 transition-transform"
                />
                <div className="flex items-center justify-center gap-1 mb-1">
                  <h3 className="font-semibold text-sm truncate">{neighbor.name}</h3>
                  {neighbor.verified && <BadgeCheck className="w-4 h-4 text-secondary-500 shrink-0" />}
                </div>
                {neighbor.area && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> {neighbor.area}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 justify-center">
                  {neighbor.skills.slice(0, 2).map((skill) => (
                    <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-amber-600 font-medium">
                  {neighbor.trust_score}% trust
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 p-8 sm:p-12 text-center text-white">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3">
              Ready to connect with your neighbors?
            </h2>
            <p className="text-primary-100 mb-6 max-w-xl mx-auto">
              Join NeighborHub today and start building a stronger, more connected community.
            </p>
            <Link to="/auth?mode=signup" className="btn bg-white text-primary-700 hover:bg-primary-50 shadow-lg">
              <Users className="w-4 h-4" /> Join Now — It's Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
