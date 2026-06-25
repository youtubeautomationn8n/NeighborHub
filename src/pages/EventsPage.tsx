import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, List, Grid3x3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { EventItem, EventCategory } from '../types';
import EventCard from '../components/EventCard';
import { EVENT_CATEGORY_LABELS } from '../lib/helpers';
import { useAuth } from '../context/AuthContext';

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<EventCategory | 'all'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('events')
      .select('*, organizer:profiles(*)')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    if (filter !== 'all') query = query.eq('event_category', filter);

    const { data } = await query;
    setEvents((data as EventItem[]) || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    const channel = supabase
      .channel('events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchEvents]);

  const monthName = currentMonth.toLocaleString('en', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const eventsByDate = events.reduce<Record<string, EventItem[]>>((acc, event) => {
    const date = event.event_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Discover and join neighborhood events</p>
        </div>
        {user && (
          <button onClick={() => navigate('/event/new')} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Event</span>
          </button>
        )}
      </div>

      {/* View toggle + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button onClick={() => setView('list')} className={`btn ${view === 'list' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500'} py-1.5`}>
            <List className="w-4 h-4" /> List
          </button>
          <button onClick={() => setView('calendar')} className={`btn ${view === 'calendar' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500'} py-1.5`}>
            <Grid3x3 className="w-4 h-4" /> Calendar
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          <button onClick={() => setFilter('all')} className={`chip shrink-0 ${filter === 'all' ? 'chip-active' : 'chip-inactive'}`}>All</button>
          {(Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[]).map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`chip shrink-0 ${filter === cat ? 'chip-active' : 'chip-inactive'}`}>
              {EVENT_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="card p-4">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">{monthName}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="btn-ghost p-2">←</button>
              <button onClick={nextMonth} className="btn-ghost p-2">→</button>
            </div>
          </div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                .toISOString().split('T')[0];
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg p-1 border ${
                    isToday ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-800'
                  } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
                >
                  <div className={`text-xs ${isToday ? 'font-bold text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}>{day}</div>
                  {dayEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="text-[10px] truncate bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 rounded px-1 py-0.5 mt-0.5">
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-400 mt-0.5">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="card p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No events found</p>
              <p className="text-sm text-gray-400">Check back later or create a new event</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
