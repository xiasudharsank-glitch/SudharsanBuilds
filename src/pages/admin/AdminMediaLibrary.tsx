import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image, Video, FileText, Music, Folder, Grid, List,
  Search, Filter, Trash2, Download, Eye, Edit, Check, X,
  RefreshCw, UploadCloud
} from 'lucide-react';
import {
  getMediaFiles,
  uploadMedia,
  bulkUploadMedia,
  deleteMedia,
  updateMedia,
  formatFileSize,
  type MediaFile
} from '../../utils/contentMediaApi';

type ViewMode = 'grid' | 'list';
type FileTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'document';

export default function AdminMediaLibrary() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, [fileTypeFilter]);

  const loadMedia = async () => {
    setLoading(true);
    const filters = fileTypeFilter !== 'all' ? { fileType: fileTypeFilter } : {};
    const data = await getMediaFiles(filters);
    setMedia(data);
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    if (files.length === 1) {
      // Single file upload
      const result = await uploadMedia(files[0]);
      if (result) {
        setMedia(prev => [result, ...prev]);
      }
    } else {
      // Bulk upload
      const { successful } = await bulkUploadMedia(files, {
        onProgress: (uploaded, total) => {
          setUploadProgress((uploaded / total) * 100);
        }
      });

      if (successful.length > 0) {
        setMedia(prev => [...successful, ...prev]);
      }
    }

    setUploading(false);
    setUploadProgress(0);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    const success = await deleteMedia(id);
    if (success) {
      setMedia(prev => prev.filter(m => m.id !== id));
      setSelectedMedia(null);
    }
  };

  const handleUpdateMetadata = async (id: string, updates: Partial<MediaFile>) => {
    const success = await updateMedia(id, updates);
    if (success) {
      setMedia(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      if (selectedMedia?.id === id) {
        setSelectedMedia({ ...selectedMedia, ...updates });
      }
    }
  };

  const filteredMedia = media.filter(m => {
    if (!searchQuery) return true;
    return m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
           m.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
           m.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const stats = {
    total: media.length,
    images: media.filter(m => m.file_type === 'image').length,
    videos: media.filter(m => m.file_type === 'video').length,
    documents: media.filter(m => m.file_type === 'document').length,
    audio: media.filter(m => m.file_type === 'audio').length,
    totalSize: media.reduce((acc, m) => acc + m.file_size, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Image className="w-10 h-10 text-cyan-500" />
              Media Library
            </h1>
            <p className="text-slate-600 mt-2">
              Manage all your images, videos, and files in one place
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                Upload Files
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-800 font-medium">Uploading files...</span>
              <span className="text-cyan-600">{(uploadProgress || 0).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-cyan-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Files</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-cyan-600">{stats.images}</div>
            <div className="text-sm text-slate-600">Images</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.videos}</div>
            <div className="text-sm text-slate-600">Videos</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.audio}</div>
            <div className="text-sm text-slate-600">Audio</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.documents}</div>
            <div className="text-sm text-slate-600">Documents</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-slate-900">{formatFileSize(stats.totalSize)}</div>
            <div className="text-sm text-slate-600">Total Size</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* File Type Filter */}
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value as FileTypeFilter)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={loadMedia}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-20">
            <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No files found</h3>
            <p className="text-slate-500">Upload your first file to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map(file => (
              <MediaCard
                key={file.id}
                media={file}
                onClick={() => setSelectedMedia(file)}
                onDelete={() => handleDelete(file.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Preview</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Size</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Uploaded</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map(file => (
                  <MediaRow
                    key={file.id}
                    media={file}
                    onClick={() => setSelectedMedia(file)}
                    onDelete={() => handleDelete(file.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Media Details Modal */}
        <AnimatePresence>
          {selectedMedia && (
            <MediaDetailsModal
              media={selectedMedia}
              onClose={() => setSelectedMedia(null)}
              onUpdate={handleUpdateMetadata}
              onDelete={() => handleDelete(selectedMedia.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Media Card Component
function MediaCard({
  media,
  onClick,
  onDelete
}: {
  media: MediaFile;
  onClick: () => void;
  onDelete: () => void;
}) {
  const getIcon = () => {
    switch (media.file_type) {
      case 'image': return <Image className="w-8 h-8" />;
      case 'video': return <Video className="w-8 h-8" />;
      case 'audio': return <Music className="w-8 h-8" />;
      case 'document': return <FileText className="w-8 h-8" />;
      default: return <FileText className="w-8 h-8" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Preview */}
      <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
        {media.file_type === 'image' ? (
          <img
            src={media.file_url}
            alt={media.alt_text || media.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-slate-400">
            {getIcon()}
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="p-2 bg-white rounded-lg hover:bg-slate-100 transition"
          >
            <Eye className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 bg-white rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-sm font-medium text-slate-900 truncate">
          {media.original_filename}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {formatFileSize(media.file_size)}
        </div>
      </div>
    </motion.div>
  );
}

// Media Row Component (List View)
function MediaRow({
  media,
  onClick,
  onDelete
}: {
  media: MediaFile;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={onClick}>
      <td className="p-4">
        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
          {media.file_type === 'image' ? (
            <img src={media.file_url} alt={media.filename} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-6 h-6 text-slate-400" />
          )}
        </div>
      </td>
      <td className="p-4 text-sm text-slate-900">{media.original_filename}</td>
      <td className="p-4 text-sm text-slate-600 capitalize">{media.file_type}</td>
      <td className="p-4 text-sm text-slate-600">{formatFileSize(media.file_size)}</td>
      <td className="p-4 text-sm text-slate-600">{new Date(media.uploaded_at).toLocaleDateString()}</td>
      <td className="p-4">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// Media Details Modal
function MediaDetailsModal({
  media,
  onClose,
  onUpdate,
  onDelete
}: {
  media: MediaFile;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<MediaFile>) => void;
  onDelete: () => void;
}) {
  const [altText, setAltText] = useState(media.alt_text || '');
  const [caption, setCaption] = useState(media.caption || '');
  const [tags, setTags] = useState(media.tags.join(', '));

  const handleSave = () => {
    onUpdate(media.id, {
      alt_text: altText,
      caption,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Media Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              {media.file_type === 'image' ? (
                <img src={media.file_url} alt={media.filename} className="w-full rounded-lg" />
              ) : (
                <div className="w-full aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-16 h-16 text-slate-400" />
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-slate-600">Size</div>
                  <div className="font-medium">{formatFileSize(media.file_size)}</div>
                </div>
                {media.width && media.height && (
                  <div>
                    <div className="text-slate-600">Dimensions</div>
                    <div className="font-medium">{media.width} � {media.height}</div>
                  </div>
                )}
                <div>
                  <div className="text-slate-600">Views</div>
                  <div className="font-medium">{media.view_count}</div>
                </div>
                <div>
                  <div className="text-slate-600">Downloads</div>
                  <div className="font-medium">{media.download_count}</div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filename
                </label>
                <input
                  type="text"
                  value={media.original_filename}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated tags"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <a
                  href={media.file_url}
                  download={media.original_filename}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
