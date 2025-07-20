"use client";

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, ExternalLink, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDownloadUrl, isCloudinaryUrl, getPdfViewerUrl } from '@/utils/cloudinary';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfViewer({ fileUrl, fileName, isOpen, onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
  }, []);

  if (!isOpen) return null;

  const handleDownload = () => {
    const downloadUrl = getDownloadUrl(fileUrl, fileName);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    const viewerUrl = getPdfViewerUrl(fileUrl);
    window.open(viewerUrl, '_blank');
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handlePrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const viewerUrl = getPdfViewerUrl(fileUrl);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {fileName || 'Document Viewer'}
            </h3>
            {!loading && numPages > 0 && (
              <span className="text-sm text-gray-500">
                Page {pageNumber} of {numPages}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Page Navigation */}
            {!loading && numPages > 1 && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNumber <= 1}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="flex justify-center">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}

            <Document
              file={viewerUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              error={
                <div className="text-center p-8">
                  <p className="text-gray-600 mb-4">
                    PDF cannot be displayed. This might be due to CORS restrictions.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleOpenInNewTab}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading=""
                error={
                  <div className="text-center p-4">
                    <p className="text-gray-600">Error loading page</p>
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}
