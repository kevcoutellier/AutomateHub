declare namespace Express {
  namespace MulterS3 {
    interface File extends Multer.File {
      bucket: string;
      key: string;
      acl: string;
      contentType: string;
      contentDisposition: null;
      storageClass: string;
      serverSideEncryption: null;
      metadata: any;
      location: string;
      etag: string;
    }
  }
}
