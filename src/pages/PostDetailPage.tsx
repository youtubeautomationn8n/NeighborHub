import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, MapPin, Pin, BadgeCheck, Eye, Flag, ArrowLeft,
  Send, FileText, Download, Trash2, Pencil
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Post, Comment, FileAttachment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  timeAgo, POST_TYPE_LABELS, POST_TYPE_COLORS, URGENCY_COLORS, URGENCY_LABELS, formatFileSize
} from '../lib/helpers';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const [postRes, commentsRes, filesRes] = await Promise.all([
      supabase.from('posts').select('*, author:profiles(*), category:categories(*)').eq('id', id).single(),
      supabase.from('comments').select('*, author:profiles(*)').eq('post_id', id).order('created_at', { ascending: true }),
      supabase.from('file_attachments').select('*').eq('post_id', id),
    ]);

    const postData = postRes.data as Post | null;
    setPost(postData);
    setComments((commentsRes.data as Comment[]) || []);
    setFiles((filesRes.data as FileAttachment[]) || []);
    setLikeCount(postData?.likes_count || 0);

    if (user && postData) {
      const { data: reaction } = await supabase
        .from('reactions')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setLiked(!!reaction);
    }

    // Increment view count
    if (postData) {
      await supabase.from('posts').update({ views_count: postData.views_count + 1 }).eq('id', id);
    }

    setLoading(false);
  }, [id, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentBody.trim() || !id) return;
    setSubmitting(true);
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: id, author_id: user.id, body: commentBody })
      .select('*, author:profiles(*)')
      .single();
    if (data) {
      setComments((prev) => [...prev, data as Comment]);
      setCommentBody('');
      await supabase.from('posts').update({ comments_count: (post?.comments_count || 0) + 1 }).eq('id', id);
    }
    setSubmitting(false);
  };

  const handleLike = async () => {
    if (!user || !id) return;
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase.from('reactions').delete().eq('post_id', id).eq('user_id', user.id);
      await supabase.from('posts').update({ likes_count: likeCount - 1 }).eq('id', id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from('reactions').insert({ post_id: id, user_id: user.id, type: 'like' });
      await supabase.from('posts').update({ likes_count: likeCount + 1 }).eq('id', id);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  const handleReport = async () => {
    if (!user || !id) return;
    const reason = prompt('Why are you reporting this post?');
    if (!reason) return;
    await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type: 'post',
      target_id: id,
      reason,
    });
    alert('Report submitted. Thank you for helping keep our community safe.');
  };

  const handleDelete = async () => {
    if (!id || !user) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    navigate('/feed');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card p-6 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
            </div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Post not found</p>
        <Link to="/feed" className="btn-primary mt-4">Back to Feed</Link>
      </div>
    );
  }

  const canEdit = user?.id === post.author_id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <article className="card p-6 mb-6">
        {/* Author */}
        <div className="flex items-start gap-3 mb-4">
          <Link to={`/profile/${post.author_id}`}>
            <img
              src={post.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`}
              alt={post.author?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${post.author_id}`} className="flex items-center gap-1.5">
              <span className="font-semibold text-sm hover:underline">{post.author?.name}</span>
              {post.author?.verified && <BadgeCheck className="w-4 h-4 text-secondary-500" />}
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{timeAgo(post.created_at)}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
          {post.pinned && (
            <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`badge ${POST_TYPE_COLORS[post.post_type]}`}>{POST_TYPE_LABELS[post.post_type]}</span>
          {post.official && <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">Official</span>}
          {post.urgency !== 'normal' && (
            <span className={`badge ${URGENCY_COLORS[post.urgency]}`}>{URGENCY_LABELS[post.urgency]} Urgency</span>
          )}
        </div>

        {/* Content */}
        <h1 className="font-display font-bold text-xl sm:text-2xl mb-3">{post.title}</h1>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{post.description}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* File attachments */}
        {files.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Attachments</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {file.preview_url ? (
                    <img src={file.preview_url} alt={file.file_name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.title || file.file_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.file_size)} · {file.file_type}</p>
                  </div>
                  <button className="btn-ghost p-2 shrink-0">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-error-500' : 'text-gray-500 hover:text-error-500'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageCircle className="w-5 h-5" />
              {post.comments_count}
            </span>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-secondary-500 transition-colors">
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Eye className="w-5 h-5" />
              {post.views_count + 1}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {canEdit && (
              <>
                <Link to={`/post/${post.id}/edit`} className="btn-ghost p-2">
                  <Pencil className="w-4 h-4" />
                </Link>
                <button onClick={handleDelete} className="btn-ghost p-2 text-error-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {user && !canEdit && (
              <button onClick={handleReport} className="btn-ghost p-2 text-gray-400 hover:text-error-500">
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="card p-6">
        <h3 className="font-semibold text-sm mb-4">Comments ({comments.length})</h3>

        {user ? (
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <img
              src={user ? `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}` : ''}
              alt="You"
              className="w-8 h-8 rounded-full shrink-0"
            />
            <input
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write a comment..."
              className="input flex-1"
            />
            <button type="submit" disabled={submitting || !commentBody.trim()} className="btn-primary shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-4 text-center py-2">
            <Link to="/auth" className="text-primary-600 hover:underline">Sign in</Link> to comment
          </p>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.name}`}
                alt={comment.author?.name}
                className="w-8 h-8 rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link to={`/profile/${comment.author_id}`} className="font-semibold text-xs hover:underline">
                      {comment.author?.name}
                    </Link>
                    <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.body}</p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}
