import React, { useState } from 'react';
import { Download, Eye, File, Image, Video, Music, FileText, Archive } from 'lucide-react';
import { fileApi } from '../../services/fileApi';

interface FileAttachmentProps {
  fileId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
  onDownload?: () => void;
  onPreview?: () => void;
  className?: string;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileId,
  originalName,
  size,
  mimeType,
  url,
  thumbnailUrl,
  isPublic,
  metadata,
  onDownload,
  onPreview,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (mimeType: string) => {
    if (fileApi.isImage(mimeType)) return <Image className="w-5 h-5" />;
    if (fileApi.isVideo(mimeType)) return <Video className="w-5 h-5" />;
    if (fileApi.isAudio(mimeType)) return <Music className="w-5 h-5" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      setIsLoading(true);
      // For now, use the provided URL or create a mock download
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = originalName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (onPreview) {
      onPreview();
      return;
    }

    try {
      setIsLoading(true);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canPreview = (mimeType: string) => {
    return fileApi.isImage(mimeType) || 
           mimeType.includes('pdf') ||
           fileApi.isVideo(mimeType) || 
           fileApi.isAudio(mimeType);
  };

  return (
    <div className={`file-attachment ${className}`}>
      {/* Image Preview */}
      {fileApi.isImage(mimeType) && (url || thumbnailUrl) && (
        <div className="mb-2">
          <img
            src={thumbnailUrl || url}
            alt={originalName}
            className="max-w-xs max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handlePreview}
            loading="lazy"
          />
        </div>
      )}

      {/* File Info */}
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
        <div className="flex-shrink-0 text-gray-500">
          {getFileIcon(mimeType)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {originalName}
            </p>
            <div className="flex items-center space-x-1 ml-2">
              {canPreview(mimeType) && (
                <button
                  onClick={handlePreview}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">
              {fileApi.formatFileSize(size)}
            </span>
            
            {metadata?.width && metadata?.height && (
              <span className="text-xs text-gray-500">
                {metadata.width} × {metadata.height}
              </span>
            )}
            
            {metadata?.duration && (
              <span className="text-xs text-gray-500">
                {Math.floor(metadata.duration / 60)}:{(metadata.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileAttachment;
