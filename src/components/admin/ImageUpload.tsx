import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Zap } from 'lucide-react';
import { uploadProjectImage, deleteProjectImage } from '../../utils/projectsApi';
import { optimizeImage, validateImageFile, formatFileSize } from '../../utils/imageOptimization';

interface ImageUploadProps {
  projectId?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  projectId = 'temp',
  images,
  onChange,
  maxImages = 10
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    let totalSaved = 0;

    for (const file of files) {
      try {
        // Validate image
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(`${file.name}: ${validation.error}`);
          continue;
        }

        const fileId = Date.now() + Math.random();
        setUploadProgress((prev) => ({ ...prev, [fileId]: 10 }));

        // Optimize image before upload
        const optimized = await optimizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          outputFormat: 'jpeg'
        });

        totalSaved += (optimized.originalSize - optimized.optimizedSize);

        setUploadProgress((prev) => ({ ...prev, [fileId]: 40 }));

        // Upload optimized image
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: Math.min((prev[fileId] || 0) + 10, 90),
          }));
        }, 100);

        const url = await uploadProjectImage(optimized.file, projectId);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

        if (url) {
          uploadedUrls.push(url);
        }

        // Clean up progress after a delay
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 500);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    }

    onChange([...images, ...uploadedUrls]);
    setUploading(false);

    // Show optimization results
    if (totalSaved > 0) {
      console.log(`✨ Optimized images! Saved ${formatFileSize(totalSaved)} (${((totalSaved / files.reduce((sum, f) => sum + f.size, 0)) * 100).toFixed(1)}% reduction)`);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];

    try {
      // Only delete from storage if it's a Supabase URL
      if (imageUrl.includes('supabase')) {
        await deleteProjectImage(imageUrl);
      }

      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-slate-600 hover:border-cyan-500 hover:bg-slate-800/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <p className="text-slate-300 font-medium">Uploading images...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400" />
              <div>
                <p className="text-slate-300 font-medium mb-1">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-slate-500">
                  PNG, JPG, GIF, WebP up to 10MB ({images.length}/{maxImages} images)
                </p>
                <p className="text-xs text-cyan-400 mt-2 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" />
                  Auto-optimization enabled
                </p>
              </div>
            </>
          )}
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                handleReorder(fromIndex, index);
              }}
              className="group relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-500 transition-all cursor-move"
            >
              <img
                src={image}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-slate-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
