import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { AuthenticatedRequest } from '../types';

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME;

if (!S3_BUCKET) {
  console.warn('Warning: S3_BUCKET_NAME environment variable is not set. File upload functionality will be disabled.');
}
export const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

// File type validation
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt,jpg,jpeg,png,gif,webp').split(',');
const ALLOWED_IMAGE_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(',');

export const fileFilter = (req: AuthenticatedRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (ALLOWED_FILE_TYPES.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`));
  }
};

export const imageFilter = (req: AuthenticatedRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (ALLOWED_IMAGE_TYPES.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Image type .${fileExtension} is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
};

// Generate S3 key with organized folder structure
export const generateS3Key = (userId: string, fileType: string, originalName: string): string => {
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const uniqueId = uuidv4().slice(0, 8);
  
  return `${fileType}/${userId}/${timestamp}-${uniqueId}${fileExtension}`;
};

// S3 upload configuration for general files
export const s3Upload = S3_BUCKET ? multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    metadata: (req: AuthenticatedRequest, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      });
    },
    key: (req: AuthenticatedRequest, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
      const userId = req.user?.id || 'anonymous';
      const fileType = (req.body?.fileType as string) || 'general';
      const s3Key = generateS3Key(userId, fileType, file.originalname);
      cb(null, s3Key);
    },
  }),
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
}) : multer({ dest: 'uploads/' }); // Fallback to local storage if S3 not configured

// S3 upload configuration specifically for images
export const s3ImageUpload = S3_BUCKET ? multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    metadata: (req: AuthenticatedRequest, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      });
    },
    key: (req: AuthenticatedRequest, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
      const userId = req.user?.id || 'anonymous';
      const s3Key = generateS3Key(userId, 'images', file.originalname);
      cb(null, s3Key);
    },
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE || '5242880'), // 5MB default for images
  },
}) : multer({ dest: 'uploads/' }); // Fallback to local storage if S3 not configured

// Generate presigned URLs for secure access
export const generatePresignedUrl = async (s3Key: string, expiresIn: number = 3600): Promise<string> => {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }
  
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

// Generate presigned URL for upload
export const generatePresignedUploadUrl = async (s3Key: string, contentType: string, expiresIn: number = 3600): Promise<string> => {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

// Delete file from S3
export const deleteFromS3 = async (s3Key: string): Promise<void> => {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }
  
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
  });

  await s3Client.send(command);
};

// Get public URL (with CloudFront if configured)
export const getPublicUrl = (s3Key: string): string => {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }
  
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;
  }
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
};
