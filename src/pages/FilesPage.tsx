import { useEffect, useState, useCallback } from 'react';
import { Search, Download, FileText, Image as ImageIcon, Eye, Clock, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FileAttachment, FileCategory } from '../types';
import { FILE_CATEGORY_LABELS, formatFileSize, timeAgo } from '../lib/helpers';

const fileTypeIcons: Record<string, typeof FileText> = {
  image: ImageIcon,
  document: FileText,
  video: FileText,
  audio: FileText,
};

const sortOptions = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'viewed', label: 'Most Viewed', icon: Eye },
  { value: 'useful', label: 'Most Useful', icon: ThumbsUp },
];

export default function FilesPage() {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FileCategory | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('latest');

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('file_attachments')
      .select('*, uploader:profiles(*)')
      .is('post_id', null)
      .is('event_id', null)
      .is('lost_found_id', null)
      .is('help_request_id', null)
      .is('marketplace_id', null);

    if (category !== 'all') query = query.eq('file_category', category);
    if (typeFilter !== 'all') query = query.eq('file_type', typeFilter);
    if (search) query = query.or(`title.ilike.%${search}%,file_name.ilike.%${search}%,description.ilike.%${search}%`);

    if (sortBy === 'viewed') query = query.order('views_count', { ascending: false });
    else if (sortBy === 'useful') query = query.order('views_count', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data } = await query.limit(50);
    setFiles((data as FileAttachment[]) || []);
    setLoading(false);
  }, [category, typeFilter, search, sortBy]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Documents & Files</h1>
        <p className="text-sm text-gray-500 mt-0.5">Shared neighborhood documents, forms, and resources</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          className="input pl-10"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-4">
        {sortOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`chip ${sortBy === opt.value ? 'chip-active' : 'chip-inactive'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {opt.label}
            </button>
          );
        })}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        <button onClick={() => setCategory('all')} className={`chip shrink-0 ${category === 'all' ? 'chip-active' : 'chip-inactive'}`}>All</button>
        <button onClick={() => setTypeFilter('all')} className={`chip shrink-0 ${typeFilter === 'all' ? 'chip-active' : 'chip-inactive'}`}>All Types</button>
        <button onClick={() => setTypeFilter('image')} className={`chip shrink-0 ${typeFilter === 'image' ? 'chip-active' : 'chip-inactive'}`}>Images</button>
        <button onClick={() => setTypeFilter('document')} className={`chip shrink-0 ${typeFilter === 'document' ? 'chip-active' : 'chip-inactive'}`}>Documents</button>
        {(Object.keys(FILE_CATEGORY_LABELS) as FileCategory[]).map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`chip shrink-0 ${category === c ? 'chip-active' : 'chip-inactive'}`}>
            {FILE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Files */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No files found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const Icon = fileTypeIcons[file.file_type] || FileText;
            return (
              <article key={file.id} className="card card-hover p-4 group">
                {file.preview_url ? (
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                    <img src={file.preview_url} alt={file.title || file.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-32 rounded-xl mb-3 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-800 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {FILE_CATEGORY_LABELS[file.file_category]}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{file.file_type}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{file.title || file.file_name}</h3>
                {file.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{file.description}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {file.views_count}</span>
                  <span>{timeAgo(file.created_at)}</span>
                </div>
                <button className="btn-outline w-full text-xs">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
