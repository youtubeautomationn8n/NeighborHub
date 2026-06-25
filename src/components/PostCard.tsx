import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, MapPin, Pin, BadgeCheck, Eye, Flag
} from 'lucide-react';
import type { Post } from '../types';
import {
  timeAgo, POST_TYPE_LABELS, POST_TYPE_COLORS, URGENCY_COLORS, URGENCY_LABELS
} from '../lib/helpers';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function PostCard({ post, onReport }: { post: Post; onReport?: (post: Post) => void }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.user_reaction || false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id);
      await supabase.from('posts').update({ likes_count: likeCount - 1 }).eq('id', post.id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from('reactions').insert({ post_id: post.id, user_id: user.id, type: 'like' });
      await supabase.from('posts').update({ likes_count: likeCount + 1 }).eq('id', post.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard?.writeText(url);
  };

  return (
    <Link to={`/post/${post.id}`} className="block">
      <article className="card card-hover p-5 group">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <img
            src={post.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`}
            alt={post.author?.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm truncate">{post.author?.name}</span>
              {post.author?.verified && <BadgeCheck className="w-4 h-4 text-secondary-500 shrink-0" />}
              {post.official && (
                <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                  Official
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{timeAgo(post.created_at)}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3" /> {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
          {post.pinned && (
            <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-primary-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
          {post.description}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`badge ${POST_TYPE_COLORS[post.post_type]}`}>
            {POST_TYPE_LABELS[post.post_type]}
          </span>
          {post.urgency !== 'normal' && (
            <span className={`badge ${URGENCY_COLORS[post.urgency]}`}>
              {URGENCY_LABELS[post.urgency]} Urgency
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-error-500' : 'text-gray-500 hover:text-error-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              {post.comments_count}
            </span>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-secondary-500 transition-colors">
              <Share2 className="w-4 h-4" />
              {post.shares_count}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Eye className="w-4 h-4" />
              {post.views_count}
            </span>
          </div>
          {user && onReport && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReport(post); }}
              className="text-gray-400 hover:text-error-500 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </article>
    </Link>
  );
}
