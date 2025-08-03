/**
 * Download Service for Academic Resources
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface DownloadResponse {
  success: boolean;
  downloadCount: number;
  error?: string;
}

export interface Resource {
  id: number;
  title: string;
  file: string | null;
  download_count: number;
}

/**
 * Get resource details including current download count
 */
export const getResourceWithDownloads = async (resourceId: number): Promise<Resource | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch resource: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get resource with downloads:', error);
    return null;
  }
};

/**
 * Increment download count for a resource (when a file is downloaded successfully)
 * This should be called only when a file actually exists and download succeeds
 */
export const incrementDownloadCount = async (resourceId: number): Promise<boolean> => {
  try {
    // Attempt to download - this will increment the counter if successful
    const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/download/`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    });

    if (response.ok) {
      // File exists and download was successful
      return true;
    } else {
      // File doesn't exist or other error
      return false;
    }
  } catch (error) {
    console.error('Failed to increment download count:', error);
    return false;
  }
};

/**
 * Check if a resource has a downloadable file
 */
export const hasDownloadableFile = async (resourceId: number): Promise<boolean> => {
  const resource = await getResourceWithDownloads(resourceId);
  return resource ? resource.file !== null : false;
};

/**
 * Download a resource file if it exists, or handle no-file case appropriately
 */
export const downloadResourceFile = async (resourceId: number, fileName?: string): Promise<DownloadResponse> => {
  try {
    // First check if the resource has a file
    const resource = await getResourceWithDownloads(resourceId);
    if (!resource) {
      return {
        success: false,
        downloadCount: 0,
        error: 'Resource not found'
      };
    }

    if (!resource.file) {
      return {
        success: false,
        downloadCount: resource.download_count,
        error: 'No file available for download'
      };
    }

    // Attempt the download
    const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/download/`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    });

    if (!response.ok) {
      // Check if it's a file not found error vs other errors
      const errorText = await response.text();
      let errorMsg = `Download failed: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMsg = errorJson.error;
        }
      } catch {
        // Not JSON, use status message
      }

      return {
        success: false,
        downloadCount: resource.download_count,
        error: errorMsg
      };
    }

    // Create blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || resource.title || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Get updated download count after successful download
    const updatedResource = await getResourceWithDownloads(resourceId);
    
    return {
      success: true,
      downloadCount: updatedResource?.download_count || resource.download_count + 1
    };
  } catch (error) {
    console.error('Download error:', error);
    const resource = await getResourceWithDownloads(resourceId);
    return {
      success: false,
      downloadCount: resource?.download_count || 0,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
};
