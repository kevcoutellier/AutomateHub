import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { File, IFile } from '../models/File';
import { deleteFromS3, getPublicUrl, generatePresignedUrl } from '../config/s3';
import { Types } from 'mongoose';

export interface FileUploadResult {
  file: IFile;
  url: string;
  thumbnailUrl?: string;
}

export interface FileAssociation {
  type: 'message' | 'expert_portfolio' | 'project_document' | 'user_avatar';
  id: string;
}

export class FileService {
  // Process uploaded file and save metadata
  static async processUploadedFile(
    fileData: Express.MulterS3.File,
    uploadedBy: string,
    association: FileAssociation,
    isPublic: boolean = false
  ): Promise<FileUploadResult> {
    try {
      // Validate file type
      const buffer = Buffer.from(''); // We'll get this from S3 if needed for validation
      
      // Create file record
      const fileRecord = new File({
        filename: fileData.key,
        originalName: fileData.originalname,
        mimeType: fileData.mimetype,
        size: fileData.size,
        url: fileData.location,
        s3Key: fileData.key,
        uploadedBy: new Types.ObjectId(uploadedBy),
        associatedWith: {
          type: association.type,
          id: new Types.ObjectId(association.id)
        },
        isPublic,
        metadata: {}
      });

      // Process image metadata if it's an image
      if (fileData.mimetype.startsWith('image/')) {
        const imageMetadata = await this.processImageMetadata(fileData);
        fileRecord.metadata = imageMetadata;
      }

      await fileRecord.save();

      const result: FileUploadResult = {
        file: fileRecord,
        url: isPublic ? getPublicUrl(fileData.key) : await generatePresignedUrl(fileData.key)
      };

      if (fileRecord.metadata?.thumbnailUrl) {
        result.thumbnailUrl = fileRecord.metadata.thumbnailUrl;
      }

      return result;
    } catch (error) {
      // Clean up uploaded file if processing fails
      if (fileData.key) {
        try {
          await deleteFromS3(fileData.key);
        } catch (cleanupError) {
          console.error('Failed to cleanup file after processing error:', cleanupError);
        }
      }
      throw error;
    }
  }

  // Process image metadata and create thumbnail
  private static async processImageMetadata(fileData: Express.MulterS3.File): Promise<any> {
    try {
      // For now, we'll return basic metadata
      // In a production environment, you might want to download the image from S3
      // to get actual dimensions and create thumbnails
      
      return {
        width: null, // Would need to fetch from S3 to get actual dimensions
        height: null,
        thumbnailUrl: null // Would create thumbnail and upload to S3
      };
    } catch (error) {
      console.error('Error processing image metadata:', error);
      return {};
    }
  }

  // Get file by ID with access control
  static async getFileById(fileId: string, userId: string): Promise<{ file: IFile; url: string } | null> {
    try {
      const file = await File.findById(fileId);
      
      if (!file) {
        return null;
      }

      // Check access permissions
      if (!file.isPublic && file.uploadedBy.toString() !== userId) {
        throw new Error('Access denied to this file');
      }

      const url = file.isPublic 
        ? getPublicUrl(file.s3Key!) 
        : await generatePresignedUrl(file.s3Key!);

      return { file, url };
    } catch (error) {
      throw error;
    }
  }

  // Get files associated with a specific entity
  static async getAssociatedFiles(
    associationType: string,
    associationId: string,
    userId?: string
  ): Promise<Array<{ file: IFile; url: string }>> {
    try {
      const query: any = {
        'associatedWith.type': associationType,
        'associatedWith.id': new Types.ObjectId(associationId)
      };

      // If not public, only show files uploaded by the user
      if (userId) {
        query.$or = [
          { isPublic: true },
          { uploadedBy: new Types.ObjectId(userId) }
        ];
      } else {
        query.isPublic = true;
      }

      const files = await File.find(query).sort({ createdAt: -1 });

      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const url = file.isPublic 
            ? getPublicUrl(file.s3Key!) 
            : await generatePresignedUrl(file.s3Key!);
          
          return { file, url };
        })
      );

      return filesWithUrls;
    } catch (error) {
      throw error;
    }
  }

  // Delete file
  static async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      const file = await File.findById(fileId);
      
      if (!file) {
        throw new Error('File not found');
      }

      // Check permissions
      if (file.uploadedBy.toString() !== userId) {
        throw new Error('Access denied');
      }

      // Delete from S3
      if (file.s3Key) {
        await deleteFromS3(file.s3Key);
      }

      // Delete from database
      await File.findByIdAndDelete(fileId);
    } catch (error) {
      throw error;
    }
  }

  // Update file metadata
  static async updateFileMetadata(
    fileId: string,
    userId: string,
    updates: Partial<Pick<IFile, 'isPublic' | 'associatedWith'>>
  ): Promise<IFile> {
    try {
      const file = await File.findById(fileId);
      
      if (!file) {
        throw new Error('File not found');
      }

      // Check permissions
      if (file.uploadedBy.toString() !== userId) {
        throw new Error('Access denied');
      }

      // Update allowed fields
      if (updates.isPublic !== undefined) {
        file.isPublic = updates.isPublic;
      }
      
      if (updates.associatedWith) {
        file.associatedWith = updates.associatedWith;
      }

      await file.save();
      return file;
    } catch (error) {
      throw error;
    }
  }

  // Get user's uploaded files
  static async getUserFiles(
    userId: string,
    page: number = 1,
    limit: number = 20,
    fileType?: string
  ): Promise<{ files: Array<{ file: IFile; url: string }>; total: number; pages: number }> {
    try {
      const query: any = { uploadedBy: new Types.ObjectId(userId) };
      
      if (fileType) {
        query['associatedWith.type'] = fileType;
      }

      const skip = (page - 1) * limit;
      
      const [files, total] = await Promise.all([
        File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        File.countDocuments(query)
      ]);

      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const url = file.isPublic 
            ? getPublicUrl(file.s3Key!) 
            : await generatePresignedUrl(file.s3Key!);
          
          return { file, url };
        })
      );

      return {
        files: filesWithUrls,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }
}
