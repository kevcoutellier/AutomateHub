import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { fileApi, FileUploadResponse } from '../../services/fileApi';

interface FileUploadProps {
  onUploadSuccess: (file: FileUploadResponse) => void;
  onUploadError?: (error: string) => void;
  associationType: 'message' | 'expert_portfolio' | 'project_document' | 'user_avatar';
  associationId: string;
  isPublic?: boolean;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: FileUploadResponse;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  associationType,
  associationId,
  isPublic = false,
  acceptedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxSizeInMB = 10,
  multiple = false,
  className = '',
  children
}) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate files
    for (const file of fileArray) {
      if (!fileApi.validateFileType(file, acceptedTypes)) {
        onUploadError?.(`File "${file.name}" has an unsupported type. Allowed types: ${acceptedTypes.join(', ')}`);
        continue;
      }

      if (!fileApi.validateFileSize(file, maxSizeInMB)) {
        onUploadError?.(`File "${file.name}" is too large. Maximum size: ${maxSizeInMB}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize upload progress
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files
    validFiles.forEach(async (file, index) => {
      try {
        const uploadIndex = uploads.length + index;
        
        // Simulate progress (since we don't have real progress from the API)
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map((upload, i) => 
            i === uploadIndex && upload.status === 'uploading'
              ? { ...upload, progress: Math.min(upload.progress + 10, 90) }
              : upload
          ));
        }, 200);

        let result: FileUploadResponse;
        
        if (fileApi.isImage(file.type)) {
          result = await fileApi.uploadFile(file, associationType, associationId, isPublic);
        } else {
          result = await fileApi.uploadFile(file, associationType, associationId, isPublic);
        }

        clearInterval(progressInterval);

        setUploads(prev => prev.map((upload, i) => 
          i === uploadIndex
            ? { ...upload, progress: 100, status: 'success' as const, result }
            : upload
        ));

        onUploadSuccess(result);

        // Remove successful upload after 3 seconds
        setTimeout(() => {
          setUploads(prev => prev.filter((_, i) => i !== uploadIndex));
        }, 3000);

      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        
        setUploads(prev => prev.map((upload, i) => 
          uploads.length + index === i
            ? { ...upload, status: 'error' as const, error: errorMessage }
            : upload
        ));

        onUploadError?.(errorMessage);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (fileApi.isImage(file.type)) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.map(type => `.${type}`).join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {children || (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              {acceptedTypes.join(', ').toUpperCase()} up to {maxSizeInMB}MB
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              {getFileIcon(upload.file)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(upload.status)}
                    <button
                      onClick={() => removeUpload(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-xs text-gray-500">
                    {fileApi.formatFileSize(upload.file.size)}
                  </div>
                  
                  {upload.status === 'uploading' && (
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {upload.status === 'error' && upload.error && (
                    <div className="text-xs text-red-500 truncate">
                      {upload.error}
                    </div>
                  )}
                  
                  {upload.status === 'success' && (
                    <div className="text-xs text-green-500">
                      Uploaded successfully
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
