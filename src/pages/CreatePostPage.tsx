import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import FileUpload, { type UploadedFile } from '../components/FileUpload';
import type { Category, PostType, Urgency, Visibility } from '../types';
import { POST_TYPE_LABELS } from '../lib/helpers';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [postType, setPostType] = useState<PostType>('discussion');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [urgency, setUrgency] = useState<Urgency>('normal');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) {
        setCategories(data as Category[]);
        if (data[0]) setCategoryId(data[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);

    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);

    const { data: post } = await supabase.from('posts').insert({
      author_id: user.id,
      neighborhood_id: profile.neighborhood_id,
      category_id: categoryId || null,
      title,
      description,
      post_type: postType,
      location: location || null,
      tags: tagArray,
      visibility,
      urgency,
    }).select().single();

    if (post && files.length > 0) {
      for (const f of files) {
        if (f.error) continue;
        await supabase.from('file_attachments').insert({
          uploader_id: user.id,
          post_id: post.id,
          file_name: f.file.name,
          file_type: f.type,
          file_category: 'notices',
          mime_type: f.file.type,
          file_size: f.file.size,
          preview_url: f.preview,
          title: f.file.name,
        });
      }
    }

    navigate(`/post/${post?.id}`);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Create a Post</h1>
        <p className="text-sm text-gray-500 mt-0.5">Share something with your neighborhood</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="What's on your mind?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={5}
            placeholder="Add more details..."
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Post Type</label>
            <select value={postType} onChange={(e) => setPostType(e.target.value as PostType)} className="input">
              {Object.entries(POST_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              placeholder="e.g., Maple Park"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="e.g., urgent, help, event"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} className="input">
              <option value="public">Public</option>
              <option value="neighbors">Neighbors Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Urgency</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)} className="input">
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <FileUpload files={files} onChange={setFiles} />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            <Send className="w-4 h-4" /> {submitting ? 'Posting...' : 'Post'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
