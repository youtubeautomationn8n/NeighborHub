import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, Rss, Calendar, Search, Heart, ShoppingBag, Users, Bell, FileText,
  Menu, X, Moon, Sun, User, LogOut, Plus, Shield, ChevronDown, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Feed', icon: Rss },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/lost-found', label: 'Lost & Found', icon: Search },
  { to: '/help', label: 'Help', icon: Heart },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/directory', label: 'Directory', icon: Users },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/files', label: 'Files', icon: FileText },
];

export default function Navbar() {
  const { user, profile, signOut, isModerator } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setNotifications(data as Notification[]);
        });
    }
  }, [user, location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg hidden sm:block">
                Neighbor<span className="text-primary-600">Hub</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDark}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user && (
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 animate-slide-down">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                          <h3 className="font-semibold text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              to={n.link || '#'}
                              className={`flex gap-3 p-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                !n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-gray-300'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{n.title}</p>
                                {n.body && <p className="text-xs text-gray-500 truncate">{n.body}</p>}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {user && profile ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
                      alt={profile.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 animate-slide-down overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                          <p className="font-semibold text-sm truncate">{profile.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          {profile.area && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {profile.area}
                            </p>
                          )}
                        </div>
                        <div className="py-1">
                          <Link to={`/profile/${user.id}`} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link to="/post/new" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <Plus className="w-4 h-4" /> Create Post
                          </Link>
                          {isModerator && (
                            <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <Shield className="w-4 h-4" /> Dashboard
                            </Link>
                          )}
                          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/auth" className="btn-ghost">Sign In</Link>
                  <Link to="/auth?mode=signup" className="btn-primary">Join</Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-down">
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              {!user && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Link to="/auth" className="btn-outline flex-1">Sign In</Link>
                  <Link to="/auth?mode=signup" className="btn-primary flex-1">Join</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
