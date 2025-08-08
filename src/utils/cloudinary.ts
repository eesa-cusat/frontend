/**
 * Cloudinary utility functions for handling media files
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Determine the appropriate Cloudinary resource type based on file extension
 * Note: PDFs can be uploaded as either image/upload or raw/upload depending on the upload method
 */
const getResourceType = (publicId: string): string => {
  const fileExtension = publicId.split('.').pop()?.toLowerCase();
  const isPdf = fileExtension === 'pdf';
  const isDocument = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(fileExtension || '');

  // For PDFs, try image/upload first (more common for PDFs uploaded via frontend)
  // For other documents, use raw/upload
  if (isPdf) {
    return 'image/upload'; // PDFs work better with image/upload
  } else if (isDocument) {
    return 'raw/upload'; // Other documents use raw/upload
  } else {
    return 'image/upload'; // Images and other files
  }
};

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

  const resourceType = getResourceType(publicId);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}${transformationString}/${publicId}`;
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

  const resourceType = getResourceType(publicId);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/w_300,h_400,c_fit,q_auto,f_jpg,pg_${page}/${publicId}`;
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

  const resourceType = getResourceType(publicId);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/fl_attachment:${downloadName}/${publicId}`;
};
