import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export enum StorageProvider {
  CLOUDINARY = 'CLOUDINARY',
  S3 = 'S3',
}

@Injectable()
export class StorageService {
  private provider: StorageProvider;

  constructor(private config: ConfigService) {
    this.provider = (this.config.get('STORAGE_PROVIDER') as StorageProvider) || StorageProvider.CLOUDINARY;

    if (this.provider === StorageProvider.CLOUDINARY) {
      cloudinary.config({
        cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.config.get('CLOUDINARY_API_KEY'),
        api_secret: this.config.get('CLOUDINARY_API_SECRET'),
      });
    }
  }

  async upload(file: Express.Multer.File, folder = 'drinsight'): Promise<{ url: string; publicId?: string; provider: StorageProvider }> {
    if (!file) throw new BadRequestException('No file provided');

    if (this.provider === StorageProvider.CLOUDINARY) {
      return this.uploadToCloudinary(file, folder);
    }

    return this.uploadToS3(file, folder);
  }

  private uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<{ url: string; publicId: string; provider: StorageProvider }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            provider: StorageProvider.CLOUDINARY,
          });
        },
      );
      stream.end(file.buffer);
    });
  }

  private async uploadToS3(file: Express.Multer.File, folder: string) {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    return {
      url: `https://${this.config.get('AWS_S3_BUCKET')}.s3.${this.config.get('AWS_S3_REGION')}.amazonaws.com/${key}`,
      publicId: key,
      provider: StorageProvider.S3,
    };
  }
}
