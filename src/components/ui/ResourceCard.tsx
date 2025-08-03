"use client";

import { useState } from 'react';
import { Download, Eye, User, Star } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const PdfViewer = dynamic(() => import('@/components/ui/PdfViewer'), { ssr: false });
import LikeButton from '@/components/ui/LikeButton';
import { isCloudinaryUrl, getPdfThumbnail, getDownloadUrl } from '@/utils/cloudinary';
import { incrementDownloadCount } from '@/services/downloadService';

interface AcademicResource {
  id: number;
  title: string;
  description: string;
  file: string;
  module: string;
  exam_type: string;
  year: number;
  semester: number;
  scheme: string;
  uploaded_by: string;
  uploaded_at: string;
  download_count: number;
  like_count?: number;
  is_liked?: boolean;
  is_featured: boolean;
  is_approved: boolean;
  file_size: number;
}

interface ResourceCardProps {
  resource: AcademicResource;
  categoryType: string;
}

export default function ResourceCard({ resource, categoryType }: ResourceCardProps) {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [downloadCount, setDownloadCount] = useState(resource.download_count || 0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Add null checks for resource
  if (!resource) {
    return <div className="bg-white rounded-lg shadow-sm p-6">Invalid resource data</div>;
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const isPdf = resource.file?.toLowerCase().includes('.pdf') || 
               (resource.file && isCloudinaryUrl(resource.file));

  const handleDownload = async () => {
    if (!resource.file || isDownloading) return;

    setIsDownloading(true);

    try {
      let downloadUrl = resource.file;
      const fileName = resource.title || 'download';

      // If it's a Cloudinary URL, get the proper download URL
      if (isCloudinaryUrl(resource.file)) {
        downloadUrl = getDownloadUrl(resource.file, fileName);
      }

      // For Cloudinary URLs or direct downloads, open in new tab
      if (isCloudinaryUrl(resource.file)) {
        window.open(downloadUrl, '_blank');
        
        // Increment download count in the background
        const success = await incrementDownloadCount(resource.id);
        if (success) {
          setDownloadCount(prev => prev + 1);
        }
      } else {
        // For non-Cloudinary URLs, try to download directly
        const response = await fetch(downloadUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Increment download count after successful download
          const success = await incrementDownloadCount(resource.id);
          if (success) {
            setDownloadCount(prev => prev + 1);
          }
        } else {
          // Fallback to opening in new tab
          window.open(downloadUrl, '_blank');
          const success = await incrementDownloadCount(resource.id);
          if (success) {
            setDownloadCount(prev => prev + 1);
          }
        }
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening the file URL directly
      window.open(resource.file, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        {/* Thumbnail for PDFs */}
        {isPdf && resource.file && isCloudinaryUrl(resource.file) && (
          <div className="mb-4">
            <Image
              src={getPdfThumbnail(resource.file)}
              alt={`${resource.title || 'Resource'} thumbnail`}
              width={400}
              height={300}
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowPdfViewer(true)}
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {resource.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              <h3 className="font-semibold text-gray-800 line-clamp-2">
                {resource.title || 'Untitled Resource'}
              </h3>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {resource.description || 'No description available'}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Module: {resource.module || 'N/A'}</span>
            <span>Sem {resource.semester || 'N/A'}</span>
          </div>

          {categoryType === "pyq" && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Exam: {resource.exam_type || 'N/A'}</span>
              <span>Year: {resource.year || 'N/A'}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatFileSize(resource.file_size || 0)}</span>
            <span>{resource.scheme || 'N/A'} Scheme</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {downloadCount}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {resource.uploaded_by || 'Unknown'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(resource.uploaded_at)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isPdf && (
            <button
              onClick={() => setShowPdfViewer(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
          )}
          <div className={isPdf ? 'flex-1' : 'w-full'}>
            <button 
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleDownload}
              disabled={!resource.file || isDownloading}
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
              {isDownloading ? 'Downloading...' : `Download (${downloadCount})`}
            </button>
          </div>
        </div>

        {/* Like Button */}
        <div className="mt-3 flex justify-center">
          <LikeButton 
            resourceId={resource.id}
            initialCount={resource.like_count || 0}
          />
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {resource.file && (
        <PdfViewer
          fileUrl={resource.file}
          fileName={resource.title || 'Resource'}
          isOpen={showPdfViewer}
          onClose={() => setShowPdfViewer(false)}
        />
      )}
    </>
  );
}
