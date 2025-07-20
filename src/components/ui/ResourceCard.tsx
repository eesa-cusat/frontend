"use client";

import { useState } from 'react';
import { Download, Eye, User, Star } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const PdfViewer = dynamic(() => import('@/components/ui/PdfViewer'), { ssr: false });
import { getDownloadUrl, isCloudinaryUrl, getPdfThumbnail } from '@/utils/cloudinary';

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDirectDownload = () => {
    const downloadUrl = getDownloadUrl(resource.file, resource.title);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = resource.title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPdf = resource.file.toLowerCase().includes('.pdf') || 
               isCloudinaryUrl(resource.file);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        {/* Thumbnail for PDFs */}
        {isPdf && isCloudinaryUrl(resource.file) && (
          <div className="mb-4">
            <Image
              src={getPdfThumbnail(resource.file)}
              alt={`${resource.title} thumbnail`}
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
                {resource.title}
              </h3>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {resource.description}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Module: {resource.module}</span>
            <span>Sem {resource.semester}</span>
          </div>

          {categoryType === "pyq" && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Exam: {resource.exam_type}</span>
              <span>Year: {resource.year}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatFileSize(resource.file_size)}</span>
            <span>{resource.scheme} Scheme</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {resource.download_count}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {resource.uploaded_by}
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
          <button
            onClick={handleDirectDownload}
            className={`${isPdf ? 'flex-1' : 'w-full'} bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PdfViewer
        fileUrl={resource.file}
        fileName={resource.title}
        isOpen={showPdfViewer}
        onClose={() => setShowPdfViewer(false)}
      />
    </>
  );
}
