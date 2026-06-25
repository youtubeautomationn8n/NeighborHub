import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';import {
  MapPin, Calendar, Star, BadgeCheck, Award, MessageSquare,
  Pencil, Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, Post, Badge } from '../types';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { timeAgo, BADGE_LABELS, BADGE_COLORS } from '../lib/helpers';

export default function ProfilePage() {
  const { id } = useParams();
  const { user, updateProfile } = useAuth();  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editArea, setEditArea] = useState('');

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('posts').select('*, author:profiles(*), category:categories(*)').eq('author_id', id).order('created_at', { ascending: false }),
      supabase.from('badges').select('*').eq('user_id', id),
    ]).then(([profileRes, postsRes, badgesRes]) => {
      setProfile((profileRes.data as Profile) || null);
      setPosts((postsRes.data as Post[]) || []);
      setBadges((badgesRes.data as Badge[]) || []);
      if (profileRes.data) {
        setEditName((profileRes.data as Profile).name);
        setEditBio((profileRes.data as Profile).bio || '');
        setEditArea((profileRes.data as Profile).area || '');
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    await updateProfile({ name: editName, bio: editBio, area: editArea });
    setEditing(false);
    if (profile) {
      setProfile({ ...profile, name: editName, bio: editBio, area: editArea });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="card p-8 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto mb-4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Profile header */}
      <div className="card overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-br from-primary-500 to-secondary-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
              alt={profile.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-900 shadow-lg"
            />
            {isOwnProfile && (
              <button onClick={() => setEditing(!editing)} className="btn-outline">
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Bio</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="input" rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Area</label>
                <input value={editArea} onChange={(e) => setEditArea(e.target.value)} className="input" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary">Save</button>
                <button onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display font-bold text-xl">{profile.name}</h1>
                {profile.verified && <BadgeCheck className="w-5 h-5 text-secondary-500" />}
                <span className={`badge capitalize ${
                  profile.role === 'admin' ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' :
                  profile.role === 'moderator' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'hidden'
                }`}>
                  {profile.role !== 'user' && <Shield className="w-3 h-3" />}
                  {profile.role}
                </span>
              </div>
              {profile.nickname && <p className="text-sm text-gray-500 mb-2">@{profile.nickname}</p>}
              {profile.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{profile.bio}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {profile.area && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {profile.area}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Joined {timeAgo(profile.join_date)}
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <Star className="w-4 h-4 fill-current" /> {profile.trust_score}% trust
                </span>
              </div>

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              {badges.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Badges
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span key={badge.id} className={`badge ${BADGE_COLORS[badge.name] || 'bg-gray-100 text-gray-600'}`}>
                        <Award className="w-3 h-3" /> {BADGE_LABELS[badge.name] || badge.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{posts.length}</p>
          <p className="text-xs text-gray-500">Posts</p>
        </div>
        <div className="card p-4 text-center">
          <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{badges.length}</p>
          <p className="text-xs text-gray-500">Badges</p>
        </div>
        <div className="card p-4 text-center">
          <Star className="w-5 h-5 text-primary-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{profile.trust_score}%</p>
          <p className="text-xs text-gray-500">Trust Score</p>
        </div>
      </div>

      {/* Posts */}
      <h2 className="font-display font-semibold text-lg mb-4">Posts by {profile.name}</h2>
      {posts.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
