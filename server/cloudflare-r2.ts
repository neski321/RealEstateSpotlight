import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// Cloudflare R2 configuration - lazy initialization
let r2Client: S3Client | null = null;

const getR2Client = () => {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
};

const getBucketName = () => process.env.CLOUDFLARE_R2_BUCKET_NAME;

// Generate public URL for uploaded files
const getPublicUrl = () => {
  const configuredUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  
  if (configuredUrl) {
    // Use the configured public URL directly (without bucket name)
    console.log(`🔧 Using configured R2 public URL: ${configuredUrl}`);
    return configuredUrl;
  }
  
  return configuredUrl;
};

const getPublicUrlValue = () => getPublicUrl();

export interface UploadResult {
  url: string;
  key: string;
}

export class CloudflareR2Service {
  /**
   * Upload a file to Cloudflare R2
   */
  static async uploadFile(
    file: Buffer,
    contentType: string,
    folder: string = 'properties'
  ): Promise<UploadResult> {
    try {
      const key = `${folder}/${randomUUID()}-${Date.now()}`;
      
      const command = new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read',
      });

      await getR2Client().send(command);
      
      const url = `${getPublicUrlValue()}/${key}`;
      
      return { url, key };
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error('Failed to upload file to R2');
    }
  }

  /**
   * Delete a file from Cloudflare R2
   */
  static async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: getBucketName(),
        Key: key,
      });

      await getR2Client().send(command);
      return true;
    } catch (error) {
      console.error('Error deleting from R2:', error);
      return false;
    }
  }

  /**
   * Extract key from R2 URL
   */
  static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Remove leading slash and extract the key
      return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } catch {
      return null;
    }
  }

  /**
   * Generate a presigned URL for direct uploads (optional)
   */
  static async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(getR2Client(), command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }
}

// Fallback service for when R2 is not configured
export class LocalImageService {
  static async uploadFile(
    file: Buffer,
    contentType: string,
    folder: string = 'properties'
  ): Promise<UploadResult> {
    // For development, return a placeholder URL
    const key = `${folder}/${randomUUID()}-${Date.now()}`;
    const url = `https://via.placeholder.com/400x300/cccccc/666666?text=${encodeURIComponent('Uploaded Image')}`;
    
    console.log(`[LocalImageService] Would upload file with key: ${key}`);
    return { url, key };
  }

  static async deleteFile(key: string): Promise<boolean> {
    console.log(`[LocalImageService] Would delete file with key: ${key}`);
    return true;
  }

  static extractKeyFromUrl(url: string): string | null {
    return null;
  }
}

// Use R2 if configured, otherwise fall back to local service
const isR2Configured = () => {
  return !!(
    process.env.CLOUDFLARE_R2_ENDPOINT && 
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  );
};

// Create a dynamic service that checks configuration at runtime
export const ImageService = {
  async uploadFile(file: Buffer, contentType: string, folder: string = 'properties') {
    if (isR2Configured()) {
      return CloudflareR2Service.uploadFile(file, contentType, folder);
    } else {
      return LocalImageService.uploadFile(file, contentType, folder);
    }
  },

  async deleteFile(key: string) {
    if (isR2Configured()) {
      return CloudflareR2Service.deleteFile(key);
    } else {
      return LocalImageService.deleteFile(key);
    }
  },

  extractKeyFromUrl(url: string) {
    if (isR2Configured()) {
      return CloudflareR2Service.extractKeyFromUrl(url);
    } else {
      return LocalImageService.extractKeyFromUrl(url);
    }
  }
};
