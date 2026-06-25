-- Make SELECT policies public so anyone with the link can view community data
-- This fixes the "blank page / slow loading" issue for unauthenticated visitors

-- Drop existing authenticated-only SELECT policies and replace with public ones
DROP POLICY IF EXISTS alerts_select ON alerts;
DROP POLICY IF EXISTS badges_select ON badges;
DROP POLICY IF EXISTS categories_select ON categories;
DROP POLICY IF EXISTS comments_select ON comments;
DROP POLICY IF EXISTS events_select ON events;
DROP POLICY IF EXISTS files_select ON file_attachments;
DROP POLICY IF EXISTS help_select ON help_requests;
DROP POLICY IF EXISTS lost_found_select ON lost_found_items;
DROP POLICY IF EXISTS market_select ON marketplace_listings;
DROP POLICY IF EXISTS mod_actions_select ON moderator_actions;
DROP POLICY IF EXISTS neighborhoods_select ON neighborhoods;
DROP POLICY IF EXISTS posts_select ON posts;
DROP POLICY IF EXISTS profiles_select_all ON profiles;
DROP POLICY IF EXISTS reactions_select ON reactions;
DROP POLICY IF EXISTS rsvps_select ON rsvps;

-- Recreate as public SELECT (anon + authenticated can read)
CREATE POLICY alerts_select ON alerts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY badges_select ON badges FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_select ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY comments_select ON comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY events_select ON events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY files_select ON file_attachments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY help_select ON help_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY lost_found_select ON lost_found_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY market_select ON marketplace_listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY mod_actions_select ON moderator_actions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY neighborhoods_select ON neighborhoods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY posts_select ON posts FOR SELECT TO anon, authenticated USING ((hidden = false) OR (auth.uid() = author_id));
CREATE POLICY profiles_select_all ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY reactions_select ON reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY rsvps_select ON rsvps FOR SELECT TO anon, authenticated USING (true);

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE lost_found_items;
ALTER PUBLICATION supabase_realtime ADD TABLE help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE file_attachments;
