import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { s3Upload, s3ImageUpload } from '../config/s3';
import { FileService } from '../services/fileService';
import { AuthenticatedRequest } from '../types';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for file uploads
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: {
    error: 'Too many upload attempts, please try again later.',
  },
});

// Validation middleware
const validateFileUpload = [
  body('associationType')
    .isIn(['message', 'expert_portfolio', 'project_document', 'user_avatar'])
    .withMessage('Invalid association type'),
  body('associationId')
    .isMongoId()
    .withMessage('Invalid association ID'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const validateFileId = [
  param('fileId').isMongoId().withMessage('Invalid file ID'),
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('fileType').optional().isIn(['message', 'expert_portfolio', 'project_document', 'user_avatar']).withMessage('Invalid file type'),
];

// Error handling middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction): express.Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return next();
};

// Upload general file
router.post(
  '/upload',
  uploadRateLimit,
  authenticate,
  s3Upload.single('file'),
  validateFileUpload,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      const { associationType, associationId, isPublic = false } = req.body;
      const userId = req.user!.id;

      const result = await FileService.processUploadedFile(
        req.file as Express.MulterS3.File,
        userId,
        { type: associationType, id: associationId },
        isPublic
      );

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileId: result.file._id,
          filename: result.file.filename,
          originalName: result.file.originalName,
          size: result.file.size,
          mimeType: result.file.mimeType,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          isPublic: result.file.isPublic,
          createdAt: result.file.createdAt,
        },
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload file',
      });
    }
  }
);

// Upload image with processing
router.post(
  '/upload/image',
  uploadRateLimit,
  authenticate,
  s3ImageUpload.single('image'),
  validateFileUpload,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image provided',
        });
      }

      const { associationType, associationId, isPublic = false } = req.body;
      const userId = req.user!.id;

      const result = await FileService.processUploadedFile(
        req.file as Express.MulterS3.File,
        userId,
        { type: associationType, id: associationId },
        isPublic
      );

      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          fileId: result.file._id,
          filename: result.file.filename,
          originalName: result.file.originalName,
          size: result.file.size,
          mimeType: result.file.mimeType,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          metadata: result.file.metadata,
          isPublic: result.file.isPublic,
          createdAt: result.file.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  }
);

// Get file by ID
router.get(
  '/:fileId',
  authenticate,
  validateFileId,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const { fileId } = req.params;
      const userId = req.user!.id;

      const result = await FileService.getFileById(fileId, userId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      return res.json({
        success: true,
        data: {
          fileId: result.file._id,
          filename: result.file.filename,
          originalName: result.file.originalName,
          size: result.file.size,
          mimeType: result.file.mimeType,
          url: result.url,
          metadata: result.file.metadata,
          isPublic: result.file.isPublic,
          associatedWith: result.file.associatedWith,
          createdAt: result.file.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Get file error:', error);
      
      if (error.message === 'Access denied to this file') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve file',
      });
    }
  }
);

// Get files associated with an entity
router.get(
  '/associated/:associationType/:associationId',
  authenticate,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const { associationType, associationId } = req.params;
      const userId = req.user!.id;

      const files = await FileService.getAssociatedFiles(associationType, associationId, userId);

      return res.json({
        success: true,
        data: files.map(({ file, url }) => ({
          fileId: file._id,
          filename: file.filename,
          originalName: file.originalName,
          size: file.size,
          mimeType: file.mimeType,
          url,
          metadata: file.metadata,
          isPublic: file.isPublic,
          createdAt: file.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('Get associated files error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve files',
      });
    }
  }
);

// Get user's files with pagination
router.get(
  '/user/files',
  authenticate,
  validatePagination,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const fileType = req.query.fileType as string;

      const result = await FileService.getUserFiles(userId, page, limit, fileType);

      return res.json({
        success: true,
        data: {
          files: result.files.map(({ file, url }) => ({
            fileId: file._id,
            filename: file.filename,
            originalName: file.originalName,
            size: file.size,
            mimeType: file.mimeType,
            url,
            metadata: file.metadata,
            isPublic: file.isPublic,
            associatedWith: file.associatedWith,
            createdAt: file.createdAt,
          })),
          pagination: {
            page,
            limit,
            total: result.total,
            pages: result.pages,
          },
        },
      });
    } catch (error: any) {
      console.error('Get user files error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve files',
      });
    }
  }
);

// Update file metadata
router.patch(
  '/:fileId',
  authenticate,
  validateFileId,
  [
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
    body('associatedWith.type')
      .optional()
      .isIn(['message', 'expert_portfolio', 'project_document', 'user_avatar'])
      .withMessage('Invalid association type'),
    body('associatedWith.id').optional().isMongoId().withMessage('Invalid association ID'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const { fileId } = req.params;
      const userId = req.user!.id;
      const updates = req.body;

      const updatedFile = await FileService.updateFileMetadata(fileId, userId, updates);

      return res.json({
        success: true,
        message: 'File updated successfully',
        data: {
          fileId: updatedFile._id,
          isPublic: updatedFile.isPublic,
          associatedWith: updatedFile.associatedWith,
          updatedAt: updatedFile.updatedAt,
        },
      });
    } catch (error: any) {
      console.error('Update file error:', error);
      
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      if (error.message === 'Access denied') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update file',
      });
    }
  }
);

// Delete file
router.delete(
  '/:fileId',
  authenticate,
  validateFileId,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const { fileId } = req.params;
      const userId = req.user!.id;

      await FileService.deleteFile(fileId, userId);

      return res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete file error:', error);
      
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      if (error.message === 'Access denied') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to delete file',
      });
    }
  }
);

export default router;
