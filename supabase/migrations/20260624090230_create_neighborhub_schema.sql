-- NeighborHub schema
-- Core entities: neighborhoods, profiles, posts, comments, reactions, events, rsvps,
-- lost_found_items, help_requests, marketplace_listings, alerts, file_attachments,
-- reports, notifications, badges, categories, moderator_actions

-- ===== CATEGORIES =====
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  color text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== NEIGHBORHOODS =====
CREATE TABLE neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== PROFILES =====
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  name text NOT NULL,
  nickname text,
  avatar_url text,
  bio text,
  area text,
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  trust_score int NOT NULL DEFAULT 50,
  verified boolean NOT NULL DEFAULT false,
  role text NOT NULL DEFAULT 'user', -- user | moderator | admin
  join_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== POSTS =====
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  category_id uuid REFERENCES categories(id),
  title text NOT NULL,
  description text NOT NULL,
  post_type text NOT NULL DEFAULT 'discussion', -- announcement|discussion|question|alert|recommendation|offer|request|file
  location text,
  tags text[] DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'public', -- public|neighbors
  urgency text NOT NULL DEFAULT 'normal', -- normal|low|medium|high
  pinned boolean NOT NULL DEFAULT false,
  official boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  likes_count int NOT NULL DEFAULT 0,
  comments_count int NOT NULL DEFAULT 0,
  shares_count int NOT NULL DEFAULT 0,
  views_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== COMMENTS =====
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== REACTIONS =====
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- ===== EVENTS =====
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  category_id uuid REFERENCES categories(id),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  event_time text NOT NULL,
  venue text NOT NULL,
  capacity int NOT NULL DEFAULT 50,
  rsvp_count int NOT NULL DEFAULT 0,
  event_category text NOT NULL DEFAULT 'meetings', -- meetings|cleanups|sports|festivals|workshops|safety
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== RSVPs =====
CREATE TABLE rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going', -- going|maybe
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- ===== LOST & FOUND =====
CREATE TABLE lost_found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  type text NOT NULL DEFAULT 'lost', -- lost|found
  item_name text NOT NULL,
  description text NOT NULL,
  last_seen_location text,
  last_seen_date date,
  contact_method text,
  image_url text,
  status text NOT NULL DEFAULT 'open', -- open|recovered|claimed
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== HELP REQUESTS =====
CREATE TABLE help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  title text NOT NULL,
  description text NOT NULL,
  help_type text NOT NULL DEFAULT 'other', -- tutor|medicine|moving|ride|elderly|other
  urgency text NOT NULL DEFAULT 'medium', -- low|medium|high
  location text,
  status text NOT NULL DEFAULT 'open', -- open|resolved
  volunteer_id uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== MARKETPLACE LISTINGS =====
CREATE TABLE marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'home', -- furniture|books|electronics|baby|home|tools
  price numeric NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  listing_type text NOT NULL DEFAULT 'sell', -- sell|free|lend|swap
  image_url text,
  location text,
  status text NOT NULL DEFAULT 'available', -- available|sold
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== ALERTS =====
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  title text NOT NULL,
  description text NOT NULL,
  alert_type text NOT NULL DEFAULT 'notice', -- road|water|power|weather|pet|emergency|notice
  severity text NOT NULL DEFAULT 'info', -- info|warning|critical
  pinned boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== FILE ATTACHMENTS =====
CREATE TABLE file_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  lost_found_id uuid REFERENCES lost_found_items(id) ON DELETE CASCADE,
  help_request_id uuid REFERENCES help_requests(id) ON DELETE CASCADE,
  marketplace_id uuid REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL, -- image|document|video|audio
  file_category text NOT NULL DEFAULT 'forms', -- forms|notices|guides|rules|flyers|safety|lostfound
  mime_type text,
  file_size bigint NOT NULL DEFAULT 0,
  storage_path text,
  preview_url text,
  download_url text,
  views_count int NOT NULL DEFAULT 0,
  title text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== REPORTS =====
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL, -- post|comment|user|file
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending|reviewing|resolved|dismissed
  moderator_id uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- ===== NOTIFICATIONS =====
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- reply|nearby|event|help|lost|moderation|announcement|file
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== BADGES =====
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL, -- helpful|verified|founder|volunteer|trusted
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ===== MODERATOR ACTIONS (AUDIT LOG) =====
CREATE TABLE moderator_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL, -- hide_post|remove_post|ban_user|approve|reject|pin|official|remove_file|manage_category
  target_type text NOT NULL,
  target_id uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== INDEXES =====
CREATE INDEX idx_posts_neighborhood ON posts(neighborhood_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_files_post ON file_attachments(post_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- ===== RLS =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderator_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Posts: read all (non-hidden), insert/update/delete own
CREATE POLICY "posts_select" ON posts FOR SELECT TO authenticated USING (hidden = false OR auth.uid() = author_id);
CREATE POLICY "posts_insert" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Comments
CREATE POLICY "comments_select" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Reactions
CREATE POLICY "reactions_select" ON reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete_own" ON reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Events
CREATE POLICY "events_select" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "events_update_own" ON events FOR UPDATE TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "events_delete_own" ON events FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- RSVPs
CREATE POLICY "rsvps_select" ON rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "rsvps_insert" ON rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rsvps_delete_own" ON rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Lost & Found
CREATE POLICY "lost_found_select" ON lost_found_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "lost_found_insert" ON lost_found_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "lost_found_update_own" ON lost_found_items FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "lost_found_delete_own" ON lost_found_items FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Help Requests
CREATE POLICY "help_select" ON help_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "help_insert" ON help_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "help_update_own" ON help_requests FOR UPDATE TO authenticated USING (auth.uid() = author_id OR auth.uid() = volunteer_id) WITH CHECK (auth.uid() = author_id OR auth.uid() = volunteer_id);
CREATE POLICY "help_delete_own" ON help_requests FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Marketplace
CREATE POLICY "market_select" ON marketplace_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "market_insert" ON marketplace_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "market_update_own" ON marketplace_listings FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "market_delete_own" ON marketplace_listings FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- Alerts
CREATE POLICY "alerts_select" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "alerts_insert" ON alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "alerts_update_own" ON alerts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "alerts_delete_own" ON alerts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- File Attachments
CREATE POLICY "files_select" ON file_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "files_insert" ON file_attachments FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "files_delete_own" ON file_attachments FOR DELETE TO authenticated USING (auth.uid() = uploader_id);

-- Reports
CREATE POLICY "reports_select_own" ON reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR auth.uid() = moderator_id);
CREATE POLICY "reports_insert" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Notifications
CREATE POLICY "notif_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Badges
CREATE POLICY "badges_select" ON badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "badges_insert" ON badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "badges_delete_own" ON badges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Moderator Actions
CREATE POLICY "mod_actions_select" ON moderator_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "mod_actions_insert" ON moderator_actions FOR INSERT TO authenticated WITH CHECK (auth.uid() = moderator_id);

-- Neighborhoods & Categories: public read
CREATE POLICY "neighborhoods_select" ON neighborhoods FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_select" ON categories FOR SELECT TO authenticated USING (true);
