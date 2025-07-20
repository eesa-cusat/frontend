/**
 * Cloudinary utility functions for handling media files
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Check if a URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
};

/**
 * Get the optimized Cloudinary URL for displaying files
 */
export const getCloudinaryUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}): string => {
  if (!isCloudinaryUrl(url)) {
    return url; // Return original URL if not from Cloudinary
  }

  // Extract the public ID from Cloudinary URL
  const urlParts = url.split('/');
  const uploadIndex = urlParts.indexOf('upload');
  
  if (uploadIndex === -1) {
    return url; // Return original if can't parse
  }

  const publicId = urlParts.slice(uploadIndex + 1).join('/');
  const transformations = [];

  // Add transformations based on options
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  // Add default optimizations for web
  if (transformations.length === 0) {
    transformations.push('q_auto', 'f_auto');
  }

  const transformationString = transformations.length > 0 ? `/${transformations.join(',')}` : '';
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload${transformationString}/${publicId}`;
};

/**
 * Get PDF viewer URL for Cloudinary PDFs
 */
export const getPdfViewerUrl = (url: string): string => {
  if (!isCloudinaryUrl(url)) {
    return url; // Return original URL if not from Cloudinary
  }

  // For PDFs, we can use Cloudinary's auto format and quality
  return getCloudinaryUrl(url, {
    quality: 'auto',
    format: 'auto'
  });
};

/**
 * Get thumbnail URL for PDF files
 */
export const getPdfThumbnail = (url: string, page: number = 1): string => {
  if (!isCloudinaryUrl(url)) {
    return url; // Return original URL if not from Cloudinary
  }

  const urlParts = url.split('/');
  const uploadIndex = urlParts.indexOf('upload');
  
  if (uploadIndex === -1) {
    return url;
  }

  const publicId = urlParts.slice(uploadIndex + 1).join('/');
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_400,c_fit,q_auto,f_jpg,pg_${page}/${publicId}`;
};

/**
 * Extract file name from Cloudinary URL
 */
export const getFileName = (url: string): string => {
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  // Remove Cloudinary transformations and get original filename
  return fileName.split('.')[0];
};

/**
 * Get direct download URL for Cloudinary files
 */
export const getDownloadUrl = (url: string, filename?: string): string => {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const urlParts = url.split('/');
  const uploadIndex = urlParts.indexOf('upload');
  
  if (uploadIndex === -1) {
    return url;
  }

  const publicId = urlParts.slice(uploadIndex + 1).join('/');
  const downloadName = filename || getFileName(url);
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment:${downloadName}/${publicId}`;
};
