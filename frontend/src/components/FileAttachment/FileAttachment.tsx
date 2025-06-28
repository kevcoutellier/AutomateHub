import React, { useState } from 'react';
import { Download, Eye, ExternalLink, File, Image, Video, Music, FileText, Archive } from 'lucide-react';
import { FileApi } from '../../services/fileApi';

interface FileAttachmentProps {
  fileId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnailUrl?: string;
  };
  className?: string;
  showPreview?: boolean;
  onPreview?: () => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileId,
  filename,
  originalName,
  mimeType,
  size,
  url,
  metadata,
  className = '',
  showPreview = true,
  onPreview
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getFileIcon = () => {
    if (FileApi.isImage(mimeType)) return <Image className="w-5 h-5" />;
    if (FileApi.isVideo(mimeType)) return <Video className="w-5 h-5" />;
    if (FileApi.isAudio(mimeType)) return <Music className="w-5 h-5" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const handleDownload = async () => {
    if (!url) {
      setIsLoading(true);
      try {
        const fileInfo = await FileApi.getFile(fileId);
        window.open(fileInfo.url, '_blank');
      } catch (error) {
        console.error('Error downloading file:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const handlePreview = async () => {
    if (onPreview) {
      onPreview();
      return;
    }

    if (!url) {
      setIsLoading(true);
      try {
        const fileInfo = await FileApi.getFile(fileId);
        setPreviewUrl(fileInfo.url);
        window.open(fileInfo.url, '_blank');
      } catch (error) {
        console.error('Error previewing file:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const canPreview = () => {
    return FileApi.isImage(mimeType) || 
           mimeType.includes('pdf') || 
           FileApi.isVideo(mimeType) || 
           FileApi.isAudio(mimeType);
  };

  return (
    <div className={`file-attachment ${className}`}>
      {/* Image Preview */}
      {FileApi.isImage(mimeType) && (url || metadata?.thumbnailUrl) && (
        <div className="mb-2">
          <img
            src={metadata?.thumbnailUrl || url}
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
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {originalName}
            </p>
            <div className="flex items-center space-x-1 ml-2">
              {showPreview && canPreview() && (
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
              {FileApi.formatFileSize(size)}
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
