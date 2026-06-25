import { formatDistanceToNow, format } from 'date-fns';

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export const POST_TYPE_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  discussion: 'Discussion',
  question: 'Question',
  alert: 'Alert',
  recommendation: 'Recommendation',
  offer: 'Offer',
  request: 'Request',
  file: 'File Post',
};

export const POST_TYPE_COLORS: Record<string, string> = {
  announcement: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  discussion: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  question: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  alert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  recommendation: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  offer: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  request: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  file: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export const URGENCY_LABELS: Record<string, string> = {
  normal: 'Normal',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const URGENCY_COLORS: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  road: 'Road Closure',
  water: 'Water Outage',
  power: 'Power Outage',
  weather: 'Weather Alert',
  pet: 'Missing Pet',
  emergency: 'Emergency',
  notice: 'Notice',
};

export const ALERT_SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
};

export const HELP_TYPE_LABELS: Record<string, string> = {
  tutor: 'Tutoring',
  medicine: 'Medicine Pickup',
  moving: 'Moving Help',
  ride: 'Need a Ride',
  elderly: 'Elderly Check-in',
  other: 'Other Help',
};

export const HELP_URGENCY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const LISTING_CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Furniture',
  books: 'Books',
  electronics: 'Electronics',
  baby: 'Baby Items',
  home: 'Home Items',
  tools: 'Tools',
};

export const LISTING_TYPE_LABELS: Record<string, string> = {
  sell: 'For Sale',
  free: 'Free',
  lend: 'For Lend',
  swap: 'For Swap',
};

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  meetings: 'Meetings',
  cleanups: 'Cleanups',
  sports: 'Sports',
  festivals: 'Festivals',
  workshops: 'Workshops',
  safety: 'Safety Meetings',
};

export const FILE_CATEGORY_LABELS: Record<string, string> = {
  forms: 'Forms',
  notices: 'Notices',
  guides: 'Guides',
  rules: 'Rules',
  flyers: 'Event Flyers',
  safety: 'Safety Documents',
  lostfound: 'Lost & Found Documents',
};

export const FILE_TYPE_ICONS: Record<string, string> = {
  image: 'Image',
  document: 'FileText',
  video: 'Video',
  audio: 'Music',
};

export const BADGE_LABELS: Record<string, string> = {
  helpful: 'Helpful',
  verified: 'Verified',
  founder: 'Founding Member',
  volunteer: 'Volunteer',
  trusted: 'Trusted',
};

export const BADGE_COLORS: Record<string, string> = {
  helpful: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  verified: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
  founder: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
  volunteer: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  trusted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_POST = 5;

export function validateFile(file: File): { valid: boolean; error?: string } {
  const allTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES];
  if (!allTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not supported` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit` };
  }
  return { valid: true };
}

export function getFileType(file: File): 'image' | 'document' | 'video' | 'audio' {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) return 'video';
  if (ALLOWED_AUDIO_TYPES.includes(file.type)) return 'audio';
  return 'document';
}
