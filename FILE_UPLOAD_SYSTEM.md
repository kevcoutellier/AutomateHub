# File Upload System Documentation

## Overview

The AutomateHub platform now includes a comprehensive file upload and management system with AWS S3 integration for secure cloud storage. This system supports file attachments in messaging, expert portfolio management, and project documentation.

## Features

### 🔒 Secure Cloud Storage
- **AWS S3 Integration**: Files are stored securely in Amazon S3 with configurable bucket settings
- **Presigned URLs**: Secure, time-limited access to files without exposing credentials
- **Access Control**: File-level permissions with public/private visibility options

### 📎 File Attachment Support
- **Message Attachments**: Send files and images in conversations between clients and experts
- **Portfolio Files**: Experts can attach documents and images to portfolio items
- **Project Documents**: Attach project-related files and documentation
- **User Avatars**: Profile image upload and management

### 🛡️ Security & Validation
- **File Type Validation**: Configurable allowed file types (PDF, DOC, images, etc.)
- **Size Limits**: Configurable maximum file sizes (10MB default, 5MB for images)
- **Virus Scanning**: Ready for integration with antivirus services
- **Rate Limiting**: Upload rate limiting to prevent abuse

### 🎨 Rich UI Components
- **Drag & Drop Upload**: Intuitive file upload with drag and drop support
- **Progress Tracking**: Real-time upload progress indicators
- **File Previews**: Image previews and file type icons
- **Error Handling**: Comprehensive error messages and validation feedback

## Architecture

### Backend Components

#### Models
- **File Model** (`src/models/File.ts`): Core file metadata storage
- **Message Model** (updated): Support for file attachments
- **Expert Model** (updated): Portfolio file attachments

#### Services
- **FileService** (`src/services/fileService.ts`): File processing and management logic
- **S3 Configuration** (`src/config/s3.ts`): AWS S3 client and upload configuration

#### Routes
- **File Routes** (`src/routes/files.ts`): RESTful API endpoints for file operations
- **Conversation Routes** (updated): Message attachment support

### Frontend Components

#### Services
- **FileApi** (`src/services/fileApi.ts`): API client for file operations

#### Components
- **FileUpload** (`src/components/FileUpload/FileUpload.tsx`): Reusable upload component
- **FileAttachment** (`src/components/FileAttachment/FileAttachment.tsx`): File display component

## API Endpoints

### File Management
```
POST   /api/files/upload              # Upload general file
POST   /api/files/upload/image        # Upload image with processing
GET    /api/files/:fileId             # Get file by ID
GET    /api/files/associated/:type/:id # Get files for entity
GET    /api/files/user/files          # Get user's files (paginated)
PATCH  /api/files/:fileId             # Update file metadata
DELETE /api/files/:fileId             # Delete file
```

### Message Attachments
```
POST   /api/conversations/:id/messages # Send message with optional attachment
```

## Configuration

### Environment Variables

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=automatehub-files
S3_BUCKET_REGION=us-east-1
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# File Upload Settings
MAX_FILE_SIZE=10485760          # 10MB in bytes
MAX_IMAGE_SIZE=5242880          # 5MB in bytes
UPLOAD_PATH=uploads/
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,webp
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
```

### AWS S3 Setup

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://automatehub-files --region us-east-1
   ```

2. **Configure CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedOrigins": ["https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Set Bucket Policy** (for public files):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::automatehub-files/public/*"
       }
     ]
   }
   ```

## Usage Examples

### Backend - Upload File

```typescript
import { FileService } from '../services/fileService';

// Process uploaded file
const result = await FileService.processUploadedFile(
  req.file as Express.MulterS3.File,
  userId,
  { type: 'expert_portfolio', id: portfolioItemId },
  true // isPublic
);
```

### Frontend - Upload Component

```tsx
import FileUpload from '../components/FileUpload/FileUpload';

<FileUpload
  onUploadSuccess={(file) => {
    console.log('File uploaded:', file);
    // Handle successful upload
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
    // Handle upload error
  }}
  associationType="expert_portfolio"
  associationId={portfolioItemId}
  isPublic={true}
  acceptedTypes={['pdf', 'doc', 'docx', 'jpg', 'png']}
  maxSizeInMB={10}
  multiple={false}
/>
```

### Frontend - Display Attachment

```tsx
import FileAttachment from '../components/FileAttachment/FileAttachment';

<FileAttachment
  fileId={attachment.fileId}
  filename={attachment.filename}
  originalName={attachment.originalName}
  mimeType={attachment.mimeType}
  size={attachment.size}
  url={attachment.url}
  metadata={attachment.metadata}
  showPreview={true}
/>
```

## File Organization

Files are organized in S3 with the following structure:

```
automatehub-files/
├── message/
│   ├── {userId}/
│   │   └── {timestamp}-{uniqueId}.{ext}
├── expert_portfolio/
│   ├── {userId}/
│   │   └── {timestamp}-{uniqueId}.{ext}
├── project_document/
│   ├── {userId}/
│   │   └── {timestamp}-{uniqueId}.{ext}
├── user_avatar/
│   ├── {userId}/
│   │   └── {timestamp}-{uniqueId}.{ext}
└── images/
    ├── {userId}/
    │   └── {timestamp}-{uniqueId}.{ext}
```

## Security Considerations

### Access Control
- Files are private by default
- Public files require explicit permission
- Presigned URLs expire after 1 hour
- User can only access their own files or public files

### File Validation
- MIME type validation
- File extension checking
- File size limits
- Malicious file detection (ready for integration)

### Rate Limiting
- 10 uploads per 15 minutes per IP
- Configurable limits per user role
- Global rate limiting for abuse prevention

## Monitoring & Logging

### File Operations
- Upload success/failure rates
- File access patterns
- Storage usage metrics
- Error tracking and alerting

### Performance Metrics
- Upload speed and completion rates
- CDN cache hit rates (if using CloudFront)
- API response times
- Storage costs and optimization

## Future Enhancements

### Planned Features
- **Image Processing**: Automatic thumbnail generation and image optimization
- **Virus Scanning**: Integration with antivirus services
- **File Versioning**: Track file changes and maintain history
- **Bulk Operations**: Multi-file upload and management
- **Advanced Search**: File content indexing and search
- **Collaboration**: File sharing and collaborative editing

### Integration Opportunities
- **CDN Integration**: CloudFront for global file delivery
- **Backup Systems**: Automated backup to multiple regions
- **Analytics**: File usage analytics and insights
- **Workflow Integration**: File processing pipelines

## Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check AWS credentials and permissions
   - Verify S3 bucket configuration
   - Check file size and type restrictions

2. **Files Not Accessible**:
   - Verify presigned URL generation
   - Check file permissions
   - Ensure proper CORS configuration

3. **Performance Issues**:
   - Monitor S3 request rates
   - Check network connectivity
   - Optimize file sizes and formats

### Debug Commands

```bash
# Test S3 connectivity
aws s3 ls s3://automatehub-files

# Check file upload
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "associationType=expert_portfolio" \
  -F "associationId=PORTFOLIO_ID"
```

## Support

For technical support or questions about the file upload system:

1. Check the troubleshooting section above
2. Review the API documentation
3. Contact the development team
4. Submit issues through the project repository

---

*This documentation is part of the AutomateHub platform. For more information, see the main project documentation.*
