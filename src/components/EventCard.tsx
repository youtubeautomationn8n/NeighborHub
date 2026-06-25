import { Link } from 'react-router-dom';
import { MapPin, Users, Clock } from 'lucide-react';
import type { EventItem } from '../types';
import { EVENT_CATEGORY_LABELS } from '../lib/helpers';

export default function EventCard({ event }: { event: EventItem }) {
  const eventDate = new Date(event.event_date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('en', { month: 'short' });
  const full = event.rsvp_count >= event.capacity;

  return (
    <Link to={`/event/${event.id}`} className="block">
      <article className="card card-hover overflow-hidden group">
        {event.image_url && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 bg-white dark:bg-gray-900 rounded-xl shadow-md px-3 py-2 text-center min-w-[3rem]">
              <div className="text-xs font-medium text-error-500 uppercase">{month}</div>
              <div className="text-xl font-bold leading-none">{day}</div>
            </div>
            <span className="absolute top-3 right-3 badge bg-secondary-600 text-white">
              {EVENT_CATEGORY_LABELS[event.event_category]}
            </span>
          </div>
        )}
        <div className="p-4">
          {!event.image_url && (
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl px-3 py-2 text-center min-w-[3rem]">
                <div className="text-xs font-medium text-primary-600 uppercase">{month}</div>
                <div className="text-xl font-bold text-primary-700 dark:text-primary-400 leading-none">{day}</div>
              </div>
              <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400">
                {EVENT_CATEGORY_LABELS[event.event_category]}
              </span>
            </div>
          )}
          <h3 className="font-display font-semibold text-base mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {event.description}
          </p>
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              {event.event_time} · {eventDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {event.venue}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              {event.rsvp_count}/{event.capacity} attending
              {full && <span className="text-error-500 font-medium">· Full</span>}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
