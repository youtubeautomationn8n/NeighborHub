import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Flag, BarChart3, Users, CheckCircle2, XCircle,
  Pin, BadgeCheck, Trash2, Ban, Clock, TrendingUp, MessageSquare, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Report, Post, ModeratorAction, Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { timeAgo, POST_TYPE_LABELS, POST_TYPE_COLORS } from '../lib/helpers';

type Tab = 'overview' | 'reports' | 'posts' | 'users' | 'audit';

export default function AdminPage() {
  const { profile, isModerator, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [actions, setActions] = useState<ModeratorAction[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, users: 0, reports: 0, events: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [reportsRes, postsRes, actionsRes, usersRes, statsRes] = await Promise.all([
      supabase.from('reports').select('*, reporter:profiles(*)').order('created_at', { ascending: false }).limit(50),
      supabase.from('posts').select('*, author:profiles(*), category:categories(*)').order('created_at', { ascending: false }).limit(50),
      supabase.from('moderator_actions').select('*, moderator:profiles(*)').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
    ]);

    setReports((reportsRes.data as Report[]) || []);
    setPosts((postsRes.data as Post[]) || []);
    setActions((actionsRes.data as ModeratorAction[]) || []);
    setUsers((usersRes.data as Profile[]) || []);

    const [userCount, reportCount, eventCount] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('events').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      posts: statsRes.count || 0,
      users: userCount.count || 0,
      reports: reportCount.count || 0,
      events: eventCount.count || 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resolveReport = async (id: string, status: 'resolved' | 'dismissed') => {
    if (!profile) return;
    await supabase.from('reports').update({ status, moderator_id: profile.id, resolved_at: new Date().toISOString() }).eq('id', id);
    await supabase.from('moderator_actions').insert({
      moderator_id: profile.id,
      action: status === 'resolved' ? 'approve' : 'reject',
      target_type: 'report',
      target_id: id,
      reason: `Report ${status}`,
    });
    fetchData();
  };

  const togglePostHidden = async (post: Post) => {
    if (!profile) return;
    const newHidden = !post.hidden;
    await supabase.from('posts').update({ hidden: newHidden }).eq('id', post.id);
    await supabase.from('moderator_actions').insert({
      moderator_id: profile.id,
      action: newHidden ? 'hide_post' : 'approve',
      target_type: 'post',
      target_id: post.id,
      reason: newHidden ? 'Hidden by moderator' : 'Unhidden by moderator',
    });
    fetchData();
  };

  const togglePin = async (post: Post) => {
    if (!profile) return;
    await supabase.from('posts').update({ pinned: !post.pinned }).eq('id', post.id);
    await supabase.from('moderator_actions').insert({
      moderator_id: profile.id,
      action: 'pin',
      target_type: 'post',
      target_id: post.id,
      reason: !post.pinned ? 'Pinned by moderator' : 'Unpinned by moderator',
    });
    fetchData();
  };

  const toggleOfficial = async (post: Post) => {
    if (!profile) return;
    await supabase.from('posts').update({ official: !post.official }).eq('id', post.id);
    await supabase.from('moderator_actions').insert({
      moderator_id: profile.id,
      action: 'official',
      target_type: 'post',
      target_id: post.id,
      reason: !post.official ? 'Marked as official' : 'Unmarked as official',
    });
    fetchData();
  };

  if (!isModerator) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="font-display font-bold text-xl mb-2">Access Denied</h1>
        <p className="text-sm text-gray-500">You need moderator or admin privileges to view this page.</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Shield }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'reports', label: 'Reports', icon: Flag },
    { key: 'posts', label: 'Posts', icon: MessageSquare },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'audit', label: 'Audit Log', icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-primary-600" />
        <div>
          <h1 className="font-display font-bold text-2xl">Moderation Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? 'Admin access' : 'Moderator access'} · Manage content and community safety
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn py-2 shrink-0 ${tab === t.key ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
              {t.key === 'reports' && stats.reports > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-error-500 text-white text-[10px] font-bold">{stats.reports}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="card p-8 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Posts', value: stats.posts, icon: MessageSquare, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                  { label: 'Total Users', value: stats.users, icon: Users, color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
                  { label: 'Pending Reports', value: stats.reports, icon: Flag, color: 'text-error-500 bg-error-50 dark:bg-error-900/20' },
                  { label: 'Total Events', value: stats.events, icon: TrendingUp, color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="card p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent reports preview */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm mb-4">Recent Reports</h3>
                {reports.filter((r) => r.status === 'pending').slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{report.reason}</p>
                      <p className="text-xs text-gray-500">by {report.reporter?.name} · {timeAgo(report.created_at)}</p>
                    </div>
                    <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">Pending</span>
                  </div>
                ))}
                {reports.filter((r) => r.status === 'pending').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No pending reports</p>
                )}
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="card p-12 text-center">
                  <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reports</p>
                </div>
              ) : reports.map((report) => (
                <div key={report.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge capitalize ${
                          report.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          report.status === 'resolved' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>{report.status}</span>
                        <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
                      </div>
                      <p className="text-sm font-medium">{report.reason}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reported by {report.reporter?.name} · Target: {report.target_type}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => resolveReport(report.id, 'resolved')} className="btn-primary text-xs py-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                        </button>
                        <button onClick={() => resolveReport(report.id, 'dismissed')} className="btn-outline text-xs py-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'posts' && (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`badge ${POST_TYPE_COLORS[post.post_type]}`}>{POST_TYPE_LABELS[post.post_type]}</span>
                        {post.pinned && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Pin className="w-3 h-3" /> Pinned</span>}
                        {post.official && <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"><BadgeCheck className="w-3 h-3" /> Official</span>}
                        {post.hidden && <span className="badge bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400">Hidden</span>}
                        <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
                      </div>
                      <Link to={`/post/${post.id}`} className="font-semibold text-sm hover:text-primary-600 block truncate">{post.title}</Link>
                      <p className="text-xs text-gray-500 mt-0.5">by {post.author?.name} · {post.likes_count} likes · {post.comments_count} comments</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => togglePin(post)} className="btn-ghost p-2" title="Pin/Unpin">
                        <Pin className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleOfficial(post)} className="btn-ghost p-2" title="Toggle Official">
                        <BadgeCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => togglePostHidden(post)} className={`btn-ghost p-2 ${post.hidden ? 'text-error-500' : ''}`} title="Hide/Show">
                        {post.hidden ? <Eye className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="card p-4 flex items-center gap-3">
                  <img src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt={u.name} className="w-10 h-10 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{u.name}</span>
                      {u.verified && <BadgeCheck className="w-4 h-4 text-secondary-500" />}
                      <span className={`badge capitalize ${
                        u.role === 'admin' ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' :
                        u.role === 'moderator' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>{u.role}</span>
                    </div>
                    <p className="text-xs text-gray-500">Trust: {u.trust_score}% · Joined {timeAgo(u.join_date)}</p>
                  </div>
                  {isAdmin && u.role !== 'admin' && (
                    <button className="btn-outline text-xs py-1.5 text-error-600 border-error-200 dark:border-error-800">
                      <Ban className="w-3.5 h-3.5" /> Ban
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'audit' && (
            <div className="space-y-3">
              {actions.map((action) => (
                <div key={action.id} className="card p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{action.moderator?.name}</span>
                      <span className="text-gray-500"> {action.action.replace(/_/g, ' ')}</span>
                      {action.target_type && <span className="text-gray-500"> on {action.target_type}</span>}
                    </p>
                    {action.reason && <p className="text-xs text-gray-400">{action.reason}</p>}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{timeAgo(action.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
