import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Share2, CheckCircle2,
  BadgeCheck, FileText, Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { EventItem, FileAttachment } from '../types';
import { useAuth } from '../context/AuthContext';
import { EVENT_CATEGORY_LABELS, formatFileSize } from '../lib/helpers';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvped, setRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    const [eventRes, filesRes] = await Promise.all([
      supabase.from('events').select('*, organizer:profiles(*)').eq('id', id).single(),
      supabase.from('file_attachments').select('*').eq('event_id', id),
    ]);
    const eventData = eventRes.data as EventItem | null;
    setEvent(eventData);
    setFiles((filesRes.data as FileAttachment[]) || []);
    setRsvpCount(eventData?.rsvp_count || 0);

    if (user && eventData) {
      const { data: rsvp } = await supabase
        .from('rsvps')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setRsvped(!!rsvp);
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const handleRSVP = async () => {
    if (!user || !id) return;
    if (rsvped) {
      setRsvped(false);
      setRsvpCount((c) => c - 1);
      await supabase.from('rsvps').delete().eq('event_id', id).eq('user_id', user.id);
      await supabase.from('events').update({ rsvp_count: rsvpCount - 1 }).eq('id', id);
    } else {
      setRsvped(true);
      setRsvpCount((c) => c + 1);
      await supabase.from('rsvps').insert({ event_id: id, user_id: user.id, status: 'going' });
      await supabase.from('events').update({ rsvp_count: rsvpCount + 1 }).eq('id', id);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card animate-pulse h-96" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Event not found</p>
        <button onClick={() => navigate('/events')} className="btn-primary mt-4">Back to Events</button>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isFull = rsvpCount >= event.capacity;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {event.image_url && (
        <div className="rounded-2xl overflow-hidden mb-6 h-56 sm:h-72">
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400">
            {EVENT_CATEGORY_LABELS[event.event_category]}
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl mb-3">{event.title}</h1>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{event.description}</p>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {eventDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {event.event_time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            {event.venue}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            {rsvpCount}/{event.capacity} attending {isFull && <span className="text-error-500 font-medium">· Full</span>}
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4">
          <img
            src={event.organizer?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${event.organizer?.name}`}
            alt={event.organizer?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">{event.organizer?.name}</span>
              {event.organizer?.verified && <BadgeCheck className="w-4 h-4 text-secondary-500" />}
            </div>
            <p className="text-xs text-gray-500">Organizer</p>
          </div>
        </div>

        {/* Attachments */}
        {files.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Attached Files</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.title || file.file_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                  </div>
                  <button className="btn-ghost p-2"><Download className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {user ? (
            <button
              onClick={handleRSVP}
              disabled={isFull && !rsvped}
              className={`btn flex-1 ${rsvped ? 'btn-outline' : 'btn-primary'} ${isFull && !rsvped ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {rsvped ? (
                <><CheckCircle2 className="w-4 h-4" /> Going — Click to Cancel</>
              ) : isFull ? (
                'Event Full'
              ) : (
                <><Users className="w-4 h-4" /> RSVP</>
              )}
            </button>
          ) : (
            <p className="text-sm text-gray-500 text-center flex-1 py-2">
              <button onClick={() => navigate('/auth')} className="text-primary-600 hover:underline">Sign in</button> to RSVP
            </p>
          )}
          <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="btn-outline">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </article>
    </div>
  );
}
