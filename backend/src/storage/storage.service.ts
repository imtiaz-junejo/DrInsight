import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';

export enum StorageProvider {
  CLOUDINARY = 'CLOUDINARY',
  S3 = 'S3',
  LOCAL = 'LOCAL',
}

@Injectable()
export class StorageService {
  private provider: StorageProvider;
  private readonly uploadsRoot: string;

  constructor(private config: ConfigService) {
    this.uploadsRoot = path.join(process.cwd(), 'uploads');
    this.provider = this.resolveProvider();
  }

  private resolveProvider(): StorageProvider {
    const configured = (this.config.get('STORAGE_PROVIDER') as StorageProvider) || StorageProvider.CLOUDINARY;
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get('CLOUDINARY_API_SECRET');

    if (configured === StorageProvider.S3 && this.config.get('AWS_S3_BUCKET')) {
      return StorageProvider.S3;
    }

    if (configured === StorageProvider.CLOUDINARY && cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      return StorageProvider.CLOUDINARY;
    }

    return StorageProvider.LOCAL;
  }

  async upload(
    file: Express.Multer.File,
    folder = 'drinsight',
  ): Promise<{ url: string; publicId?: string; provider: StorageProvider }> {
    if (!file?.buffer?.length) throw new BadRequestException('No file provided');

    if (this.provider === StorageProvider.CLOUDINARY) {
      return this.uploadToCloudinary(file, folder);
    }

    if (this.provider === StorageProvider.S3) {
      return this.uploadToS3(file, folder);
    }

    return this.uploadToLocal(file, folder);
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string; provider: StorageProvider }> {
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

  private async uploadToLocal(file: Express.Multer.File, folder: string) {
    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.\./g, '');
    const targetDir = path.join(this.uploadsRoot, safeFolder);
    await mkdir(targetDir, { recursive: true });

    const ext = path.extname(file.originalname) || this.extFromMime(file.mimetype);
    const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(targetDir, filename);
    await writeFile(filePath, file.buffer);

    const relativePath = `${safeFolder}/${filename}`.replace(/\\/g, '/');
    const baseUrl = (this.config.get('PUBLIC_API_URL') || `http://localhost:${this.config.get('PORT') || 4000}`).replace(
      /\/$/,
      '',
    );

    return {
      url: `${baseUrl}/uploads/${relativePath}`,
      publicId: relativePath,
      provider: StorageProvider.LOCAL,
    };
  }

  private extFromMime(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
    };
    return map[mimetype] || '.bin';
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
