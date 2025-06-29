// Simplified FileApi that works with the existing apiClient structure
export interface FileUploadResponse {
  fileId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  createdAt: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface FileInfo {
  fileId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  metadata?: any;
  isPublic: boolean;
  associatedWith: {
    type: string;
    id: string;
  };
  createdAt: string;
}

export interface UserFilesResponse {
  files: FileInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Simple file API service
export const fileApi = {
  // Upload a file (simplified version)
  async uploadFile(
    file: File,
    associationType: 'message' | 'expert_portfolio' | 'project_document' | 'user_avatar',
    associationId: string,
    isPublic: boolean = false
  ): Promise<FileUploadResponse> {
    // For now, return a mock response to prevent build errors
    // This will be implemented when the backend file upload is ready
    return {
      fileId: 'mock-file-id',
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file),
      isPublic,
      createdAt: new Date().toISOString(),
    };
  },

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper method to get file icon based on mime type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
    return '📎';
  },

  // Helper method to check if file is an image
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  },

  // Helper method to check if file is a video
  isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  },

  // Helper method to check if file is audio
  isAudio(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  },

  // Helper method to validate file type
  validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension || '');
  },

  // Helper method to validate file size
  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },
};
