import { api } from './api';

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

export class FileApi {
  // Upload a general file
  static async uploadFile(
    file: File,
    associationType: 'message' | 'expert_portfolio' | 'project_document' | 'user_avatar',
    associationId: string,
    isPublic: boolean = false
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('associationType', associationType);
    formData.append('associationId', associationId);
    formData.append('isPublic', isPublic.toString());

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  // Upload an image with processing
  static async uploadImage(
    file: File,
    associationType: 'message' | 'expert_portfolio' | 'project_document' | 'user_avatar',
    associationId: string,
    isPublic: boolean = false
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('associationType', associationType);
    formData.append('associationId', associationId);
    formData.append('isPublic', isPublic.toString());

    const response = await api.post('/files/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  // Get file by ID
  static async getFile(fileId: string): Promise<FileInfo> {
    const response = await api.get(`/files/${fileId}`);
    return response.data.data;
  }

  // Get files associated with an entity
  static async getAssociatedFiles(
    associationType: string,
    associationId: string
  ): Promise<FileInfo[]> {
    const response = await api.get(`/files/associated/${associationType}/${associationId}`);
    return response.data.data;
  }

  // Get user's files with pagination
  static async getUserFiles(
    page: number = 1,
    limit: number = 20,
    fileType?: string
  ): Promise<UserFilesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (fileType) {
      params.append('fileType', fileType);
    }

    const response = await api.get(`/files/user/files?${params}`);
    return response.data.data;
  }

  // Update file metadata
  static async updateFile(
    fileId: string,
    updates: {
      isPublic?: boolean;
      associatedWith?: {
        type: string;
        id: string;
      };
    }
  ): Promise<{ fileId: string; isPublic: boolean; associatedWith: any; updatedAt: string }> {
    const response = await api.patch(`/files/${fileId}`, updates);
    return response.data.data;
  }

  // Delete file
  static async deleteFile(fileId: string): Promise<void> {
    await api.delete(`/files/${fileId}`);
  }

  // Helper method to format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper method to get file icon based on mime type
  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
    return '📎';
  }

  // Helper method to check if file is an image
  static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  // Helper method to check if file is a video
  static isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  // Helper method to check if file is audio
  static isAudio(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  // Helper method to validate file type
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension || '');
  }

  // Helper method to validate file size
  static validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}
