import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, HandHeart, MapPin, CheckCircle2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { HelpRequest, HelpType, HelpUrgency, HelpStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { HELP_TYPE_LABELS, HELP_URGENCY_COLORS, timeAgo } from '../lib/helpers';

export default function HelpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<HelpType | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<HelpUrgency | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<HelpStatus | 'all'>('all');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('help_requests')
      .select('*, author:profiles(*), volunteer:profiles!help_requests_volunteer_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (typeFilter !== 'all') query = query.eq('help_type', typeFilter);
    if (urgencyFilter !== 'all') query = query.eq('urgency', urgencyFilter);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);

    const { data } = await query;
    setRequests((data as HelpRequest[]) || []);
    setLoading(false);
  }, [typeFilter, urgencyFilter, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const volunteer = async (request: HelpRequest) => {
    if (!user) return;
    await supabase
      .from('help_requests')
      .update({ volunteer_id: user.id })
      .eq('id', request.id);
    fetchRequests();
  };

  const markResolved = async (request: HelpRequest) => {
    if (!user) return;
    await supabase
      .from('help_requests')
      .update({ status: 'resolved' })
      .eq('id', request.id);
    fetchRequests();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Help & Support</h1>
          <p className="text-sm text-gray-500 mt-0.5">Neighbors helping neighbors</p>
        </div>
        {user && (
          <button onClick={() => navigate('/help/new')} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Request Help</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setTypeFilter('all')} className={`chip shrink-0 ${typeFilter === 'all' ? 'chip-active' : 'chip-inactive'}`}>All Types</button>
          {(Object.keys(HELP_TYPE_LABELS) as HelpType[]).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`chip shrink-0 ${typeFilter === t ? 'chip-active' : 'chip-inactive'}`}>
              {HELP_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'low', 'medium', 'high'] as const).map((u) => (
            <button key={u} onClick={() => setUrgencyFilter(u)} className={`chip capitalize ${urgencyFilter === u ? 'chip-active' : 'chip-inactive'}`}>
              {u === 'all' ? 'All Urgency' : `${u} urgency`}
            </button>
          ))}
          <button onClick={() => setStatusFilter('all')} className={`chip ${statusFilter === 'all' ? 'chip-active' : 'chip-inactive'}`}>All</button>
          <button onClick={() => setStatusFilter('open')} className={`chip ${statusFilter === 'open' ? 'chip-active' : 'chip-inactive'}`}>Open</button>
          <button onClick={() => setStatusFilter('resolved')} className={`chip ${statusFilter === 'resolved' ? 'chip-active' : 'chip-inactive'}`}>Resolved</button>
        </div>
      </div>

      {/* Requests */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center">
          <HandHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No help requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <article key={req.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={req.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${req.author?.name}`}
                  alt={req.author?.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{req.author?.name}</span>
                    <span className="text-xs text-gray-500">{timeAgo(req.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                      {HELP_TYPE_LABELS[req.help_type]}
                    </span>
                    <span className={`badge ${HELP_URGENCY_COLORS[req.urgency]} capitalize`}>
                      {req.urgency} urgency
                    </span>
                    <span className={`badge capitalize ${req.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-base mb-1">{req.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{req.description}</p>
              {req.location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> {req.location}
                </div>
              )}
              {req.volunteer && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 mb-3">
                  <User className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-primary-700 dark:text-primary-400">
                    Volunteer: <strong>{req.volunteer.name}</strong>
                  </span>
                </div>
              )}
              {user && req.status === 'open' && req.author_id !== user.id && !req.volunteer && (
                <button onClick={() => volunteer(req)} className="btn-primary w-full">
                  <HandHeart className="w-4 h-4" /> I Can Help
                </button>
              )}
              {user && (req.author_id === user.id || req.volunteer_id === user.id) && req.status === 'open' && (
                <button onClick={() => markResolved(req)} className="btn-outline w-full">
                  <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
