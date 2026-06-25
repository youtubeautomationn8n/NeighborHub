import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Pin, Droplets, Zap, CloudRain, PawPrint, Siren, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Alert, AlertType } from '../types';
import { ALERT_TYPE_LABELS, ALERT_SEVERITY_COLORS, timeAgo } from '../lib/helpers';
const alertIcons: Record<string, typeof AlertTriangle> = {
  road: AlertTriangle,
  water: Droplets,
  power: Zap,
  weather: CloudRain,
  pet: PawPrint,
  emergency: Siren,
  notice: Info,
};

const severityBorder: Record<string, string> = {
  info: 'border-l-blue-400',
  warning: 'border-l-amber-400',
  critical: 'border-l-red-400',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('alerts')
      .select('*, author:profiles(*)')
      .eq('active', true)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (typeFilter !== 'all') query = query.eq('alert_type', typeFilter);

    const { data } = await query;
    setAlerts((data as Alert[]) || []);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  useEffect(() => {
    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => fetchAlerts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAlerts]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Community Alerts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Stay informed about safety and neighborhood issues</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        <button onClick={() => setTypeFilter('all')} className={`chip shrink-0 ${typeFilter === 'all' ? 'chip-active' : 'chip-inactive'}`}>All Alerts</button>
        {(Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map((t) => {
          const Icon = alertIcons[t];
          return (
            <button key={t} onClick={() => setTypeFilter(t)} className={`chip shrink-0 ${typeFilter === t ? 'chip-active' : 'chip-inactive'}`}>
              <Icon className="w-3.5 h-3.5" /> {ALERT_TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active alerts</p>
          <p className="text-sm text-gray-400 mt-1">All clear in your neighborhood!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.alert_type] || Info;
            return (
              <article
                key={alert.id}
                className={`card p-4 border-l-4 ${severityBorder[alert.severity]} ${alert.pinned ? 'ring-2 ring-amber-200 dark:ring-amber-800' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ALERT_SEVERITY_COLORS[alert.severity]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`badge ${ALERT_SEVERITY_COLORS[alert.severity]}`}>
                        {ALERT_TYPE_LABELS[alert.alert_type]}
                      </span>
                      {alert.pinned && (
                        <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{timeAgo(alert.created_at)}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <img
                        src={alert.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${alert.author?.name}`}
                        alt={alert.author?.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>by {alert.author?.name}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
