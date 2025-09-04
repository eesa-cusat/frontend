/**
 * Real-time Download Counter Component
 */
"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';

interface DownloadButtonProps {
  resourceId: number;
  resourceTitle: string;
  resourceFile?: string;
  initialCount?: number;
  onDownloadChange?: (newCount: number) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// API Functions
const downloadResource = async (resourceId: number) => {
  try {
    const downloadUrl = `${API_BASE_URL}/academics/resources/${resourceId}/download/`;
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/octet-stream, */*',
      },
      mode: 'cors',
      credentials: 'include'
    });
    
    if (response.ok) {
      // Get the filename from the Content-Disposition header or use fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      
      if (contentDisposition) {
        const filenameMat = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMat && filenameMat[1]) {
          filename = filenameMat[1];
        }
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true; // Download successful
    } else {
      throw new Error(`Download failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

const getResourceStats = async (resourceId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/stats/`, {
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch resource stats');
    }
    
    const stats = await response.json();
    
    return {
      id: stats.id,
      likeCount: stats.like_count || 0,
      downloadCount: stats.download_count || 0,
      isLiked: stats.is_liked || false,
      viewCount: stats.view_count || 0
    };
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    throw error;
  }
};

const DownloadButton: React.FC<DownloadButtonProps> = ({
  resourceId,
  resourceTitle,
  resourceFile,
  initialCount = 0,
  onDownloadChange
}) => {
  const [downloadCount, setDownloadCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load initial download count from backend
    const loadResourceStats = async () => {
      try {
        const stats = await getResourceStats(resourceId);
        setDownloadCount(stats.downloadCount);
      } catch (error) {
        console.error('❌ Failed to load resource stats:', error);
        // Fallback to initial value
        setDownloadCount(initialCount);
      }
    };
    
    loadResourceStats();
  }, [resourceId, initialCount]);

  const handleDownload = async () => {
    if (loading) return;

    setLoading(true);
    
    try {
      await downloadResource(resourceId);
      
      // Update download count immediately for better UX
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);
      
      if (onDownloadChange) {
        onDownloadChange(newCount);
      }
      
      // Optionally refresh stats after a delay to ensure server consistency
      setTimeout(async () => {
        try {
          const stats = await getResourceStats(resourceId);
          setDownloadCount(stats.downloadCount);
          if (onDownloadChange) {
            onDownloadChange(stats.downloadCount);
          }
        } catch (error) {
          console.error('Failed to refresh download count:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to download file:', error);
      
      // Fallback: try to open the direct file URL
      if (resourceFile) {
        try {
          let fileUrl = resourceFile;
          if (!resourceFile.startsWith('http')) {
            const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:8000';
            fileUrl = `${baseUrl}${resourceFile.startsWith('/') ? '' : '/'}${resourceFile}`;
          }
          window.open(fileUrl, "_blank");
        } catch (fallbackError) {
          alert('Failed to download file. Please try again or contact support.');
        }
      } else {
        alert('Failed to download file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
      title={`Download ${resourceTitle}`}
      aria-label={`Download ${resourceTitle} - ${downloadCount} downloads`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download ({downloadCount})
        </>
      )}
    </button>
  );
};

export default DownloadButton;
