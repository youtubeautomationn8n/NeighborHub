import { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video, Music, CheckCircle2 } from 'lucide-react';
import { validateFile, getFileType, formatFileSize, MAX_FILES_PER_POST } from '../lib/helpers';
import { cn } from '../lib/utils';

export interface UploadedFile {
  file: File;
  preview: string | null;
  type: 'image' | 'document' | 'video' | 'audio';
  progress: number;
  error?: string;
}

interface FileUploadProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  label?: string;
}

export default function FileUpload({ files, onChange, label = 'Attach files' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const remaining = MAX_FILES_PER_POST - files.length;
    if (remaining <= 0) return;

    const validFiles: UploadedFile[] = [];
    Array.from(newFiles).slice(0, remaining).forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validFiles.push({
          file,
          preview: null,
          type: getFileType(file),
          progress: 0,
          error: validation.error,
        });
      } else {
        const type = getFileType(file);
        let preview: string | null = null;
        if (type === 'image') {
          preview = URL.createObjectURL(file);
        }
        validFiles.push({ file, preview, type, progress: 100 });
      }
    });

    onChange([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const fileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
        )}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drag & drop or <span className="text-primary-600 font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Images, PDFs, docs, videos · Max {formatFileSize(10 * 1024 * 1024)} · {MAX_FILES_PER_POST} files max
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,audio/mpeg"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500">{files.length} file(s) attached</p>
          {files.map((f, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border',
                f.error
                  ? 'border-error-200 bg-error-50 dark:bg-error-900/20 dark:border-error-800'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
              )}
            >
              {f.preview ? (
                <img src={f.preview} alt={f.file.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400 shrink-0">
                  {fileIcon(f.type)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{f.file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(f.file.size)} · {f.type}
                </p>
                {f.error && <p className="text-xs text-error-500 mt-0.5">{f.error}</p>}
              </div>
              {!f.error && <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
