export type UserRole = 'user' | 'moderator' | 'admin';

export type PostType =
  | 'announcement'
  | 'discussion'
  | 'question'
  | 'alert'
  | 'recommendation'
  | 'offer'
  | 'request'
  | 'file';

export type Urgency = 'normal' | 'low' | 'medium' | 'high';

export type Visibility = 'public' | 'neighbors';

export type FileType = 'image' | 'document' | 'video' | 'audio';

export type FileCategory =
  | 'forms'
  | 'notices'
  | 'guides'
  | 'rules'
  | 'flyers'
  | 'safety'
  | 'lostfound';

export type AlertType =
  | 'road'
  | 'water'
  | 'power'
  | 'weather'
  | 'pet'
  | 'emergency'
  | 'notice';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type HelpType = 'tutor' | 'medicine' | 'moving' | 'ride' | 'elderly' | 'other';

export type HelpUrgency = 'low' | 'medium' | 'high';

export type HelpStatus = 'open' | 'resolved';

export type ListingType = 'sell' | 'free' | 'lend' | 'swap';

export type ListingCategory =
  | 'furniture'
  | 'books'
  | 'electronics'
  | 'baby'
  | 'home'
  | 'tools';

export type LostFoundType = 'lost' | 'found';

export type LostFoundStatus = 'open' | 'recovered' | 'claimed';

export type EventCategory =
  | 'meetings'
  | 'cleanups'
  | 'sports'
  | 'festivals'
  | 'workshops'
  | 'safety';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export type NotificationType =
  | 'reply'
  | 'nearby'
  | 'event'
  | 'help'
  | 'lost'
  | 'moderation'
  | 'announcement'
  | 'file';

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  description: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  neighborhood_id: string | null;
  name: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  area: string | null;
  skills: string[];
  interests: string[];
  trust_score: number;
  verified: boolean;
  role: UserRole;
  join_date: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface Post {
  id: string;
  author_id: string;
  neighborhood_id: string | null;
  category_id: string | null;
  title: string;
  description: string;
  post_type: PostType;
  location: string | null;
  tags: string[];
  visibility: Visibility;
  urgency: Urgency;
  pinned: boolean;
  official: boolean;
  hidden: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: Category;
  neighborhood?: Neighborhood;
  user_reaction?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile;
}

export interface EventItem {
  id: string;
  organizer_id: string;
  neighborhood_id: string | null;
  category_id: string | null;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  capacity: number;
  rsvp_count: number;
  event_category: EventCategory;
  image_url: string | null;
  created_at: string;
  organizer?: Profile;
  neighborhood?: Neighborhood;
  user_rsvp?: boolean;
}

export interface LostFoundItem {
  id: string;
  author_id: string;
  neighborhood_id: string | null;
  type: LostFoundType;
  item_name: string;
  description: string;
  last_seen_location: string | null;
  last_seen_date: string | null;
  contact_method: string | null;
  image_url: string | null;
  status: LostFoundStatus;
  created_at: string;
  author?: Profile;
  neighborhood?: Neighborhood;
}

export interface HelpRequest {
  id: string;
  author_id: string;
  neighborhood_id: string | null;
  title: string;
  description: string;
  help_type: HelpType;
  urgency: HelpUrgency;
  location: string | null;
  status: HelpStatus;
  volunteer_id: string | null;
  created_at: string;
  author?: Profile;
  volunteer?: Profile;
  neighborhood?: Neighborhood;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  neighborhood_id: string | null;
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  is_free: boolean;
  listing_type: ListingType;
  image_url: string | null;
  location: string | null;
  status: string;
  created_at: string;
  seller?: Profile;
  neighborhood?: Neighborhood;
}

export interface Alert {
  id: string;
  author_id: string;
  neighborhood_id: string | null;
  title: string;
  description: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  pinned: boolean;
  active: boolean;
  created_at: string;
  author?: Profile;
  neighborhood?: Neighborhood;
}

export interface FileAttachment {
  id: string;
  uploader_id: string;
  post_id: string | null;
  event_id: string | null;
  lost_found_id: string | null;
  help_request_id: string | null;
  marketplace_id: string | null;
  file_name: string;
  file_type: FileType;
  file_category: FileCategory;
  mime_type: string | null;
  file_size: number;
  storage_path: string | null;
  preview_url: string | null;
  download_url: string | null;
  views_count: number;
  title: string | null;
  description: string | null;
  created_at: string;
  uploader?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: ReportStatus;
  moderator_id: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ModeratorAction {
  id: string;
  moderator_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  reason: string | null;
  created_at: string;
  moderator?: Profile;
}
