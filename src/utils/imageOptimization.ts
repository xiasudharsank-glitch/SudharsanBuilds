/**
 * Client-side image optimization utility
 * Automatically compresses and resizes images before upload to save bandwidth and storage
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  outputFormat?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface OptimizedImage {
  file: File;
  blob: Blob;
  url: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

// Default optimization settings
const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  outputFormat: 'jpeg',
  maintainAspectRatio: true
};

/**
 * Optimize a single image
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          const maxWidth = opts.maxWidth!;
          const maxHeight = opts.maxHeight!;

          if (opts.maintainAspectRatio) {
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }
          } else {
            width = Math.min(width, maxWidth);
            height = Math.min(height, maxHeight);
          }

          // Create canvas and draw image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }

              // Create optimized file
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, `.${opts.outputFormat}`),
                { type: `image/${opts.outputFormat}` }
              );

              // Calculate compression ratio
              const originalSize = file.size;
              const optimizedSize = blob.size;
              const compressionRatio = ((1 - optimizedSize / originalSize) * 100).toFixed(2);

              resolve({
                file: optimizedFile,
                blob,
                url: URL.createObjectURL(blob),
                originalSize,
                optimizedSize,
                compressionRatio: parseFloat(compressionRatio),
                width,
                height
              });
            },
            `image/${opts.outputFormat}`,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimize multiple images in parallel
 */
export async function optimizeImages(
  files: File[],
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage[]> {
  const promises = files.map(file => optimizeImage(file, options));
  return Promise.all(promises);
}

/**
 * Generate multiple sizes (thumbnail, medium, large) for responsive images
 */
export async function generateResponsiveSizes(
  file: File
): Promise<{
  thumbnail: OptimizedImage;
  medium: OptimizedImage;
  large: OptimizedImage;
  original?: OptimizedImage;
}> {
  const [thumbnail, medium, large] = await Promise.all([
    optimizeImage(file, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.8,
      outputFormat: 'jpeg'
    }),
    optimizeImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.85,
      outputFormat: 'jpeg'
    }),
    optimizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85,
      outputFormat: 'jpeg'
    })
  ]);

  return { thumbnail, medium, large };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'File is not an image'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB'
    };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!supportedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported image format. Supported: JPEG, PNG, GIF, WebP, SVG'
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Get image dimensions without loading the full image
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    img.src = url;
  });
}

/**
 * Create a preview thumbnail for display
 */
export async function createPreviewThumbnail(file: File): Promise<string> {
  const optimized = await optimizeImage(file, {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.7,
    outputFormat: 'jpeg'
  });

  return optimized.url;
}

/**
 * Auto-optimize image for avatar uploads (square crop)
 */
export async function optimizeAvatar(file: File): Promise<OptimizedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const size = 400; // Avatar size
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate crop (center)
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;

          // Enable smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw cropped and resized image
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            size,
            size
          );

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }

              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'),
                { type: 'image/jpeg' }
              );

              resolve({
                file: optimizedFile,
                blob,
                url: URL.createObjectURL(blob),
                originalSize: file.size,
                optimizedSize: blob.size,
                compressionRatio: ((1 - blob.size / file.size) * 100),
                width: size,
                height: size
              });
            },
            'image/jpeg',
            0.85
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Batch optimize images with progress callback
 */
export async function optimizeImagesWithProgress(
  files: File[],
  options: ImageOptimizationOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<OptimizedImage[]> {
  const results: OptimizedImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const optimized = await optimizeImage(files[i], options);
    results.push(optimized);

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return results;
}

// =====================================================
// LAZY LOADING WITH INTERSECTION OBSERVER
// =====================================================

/**
 * Setup lazy loading for images using IntersectionObserver
 */
export function setupLazyLoading(selector: string = 'img[data-src]') {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    document.querySelectorAll<HTMLImageElement>(selector).forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) img.src = src;
    });
    return () => {};
  }

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          const srcset = img.getAttribute('data-srcset');

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px', // Load 50px before entering viewport
      threshold: 0.01
    }
  );

  document.querySelectorAll<HTMLImageElement>(selector).forEach(img => {
    imageObserver.observe(img);
  });

  // Return cleanup function
  return () => imageObserver.disconnect();
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

// =====================================================
// CDN / CLOUDINARY HELPERS
// =====================================================

export interface CDNTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpeg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'auto' | 'face' | 'center';
  dpr?: 1 | 2 | 3; // Device pixel ratio
}

/**
 * Generate Cloudinary URL with transformations
 */
export function cloudinaryUrl(
  publicId: string,
  options: CDNTransformOptions = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    dpr = 1
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (dpr > 1) transformations.push(`dpr_${dpr}`);

  const transformString = transformations.join(',');
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generate srcset for CDN images with different DPRs
 */
export function cdnResponsiveSrcSet(
  publicId: string,
  baseOptions: CDNTransformOptions = {}
): string {
  const dprs = [1, 2, 3];
  return dprs
    .map(dpr => {
      const url = cloudinaryUrl(publicId, { ...baseOptions, dpr });
      return `${url} ${dpr}x`;
    })
    .join(', ');
}

/**
 * Generate responsive srcset for Supabase Storage
 */
export function generateSupabaseSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  return sizes
    .map(size => `${baseUrl}?width=${size}&quality=80 ${size}w`)
    .join(', ');
}

// =====================================================
// BLUR-UP PLACEHOLDER
// =====================================================

/**
 * Generate tiny base64 placeholder for blur-up effect
 */
export async function generateBlurPlaceholder(file: File): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = 10;
  canvas.height = 10;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 10, 10);
      resolve(canvas.toDataURL('image/jpeg', 0.1));
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get average color from image for placeholder background
 */
export async function getAverageColor(file: File): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = 1;
  canvas.height = 1;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
