import { Storage } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import { env, getEnv } from 'src/config/env';

@Injectable()
export class StorageService {
  private readonly envPath = process.env.NODE_ENV === 'main' ? 'production' : 'development';
  private storage: Storage;
  private bucket: string;
  private readonly logger = new Logger(StorageService.name);
  constructor() {
    this.storage = new Storage({
      projectId: 'simmortals',
      credentials: {
        client_email: 'storage@simmortals.iam.gserviceaccount.com',
        private_key: env.storage.privateKey.split(String.raw`\n`).join('\n'),
      },
    });
    this.bucket = getEnv() === 'prod' ? 'simmortals' : 'simmortals-dev';
  }

  async save(path: string, file: Buffer) {
    try {
      await this.storage.bucket(this.bucket).file(path).save(file, {
        resumable: false,
      });
    } catch (error) {
      this.logger.error('Failed to save file', error);
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      const [exists] = await this.storage.bucket(this.bucket).file(path).exists();
      return exists;
    } catch (error) {
      this.logger.error('Failed to check if file exists', error);
      return false;
    }
  }

  async getMetadata(path: string) {
    try {
      const file = await this.storage.bucket(this.bucket).file(path).getMetadata();
      return file[0];
    } catch (error) {
      this.logger.error('Failed to get metadata', error);
    }
  }

  async download(path: string): Promise<Buffer | null> {
    try {
      const data = await this.storage.bucket(this.bucket).file(path).download();
      return data[0];
    } catch (error) {
      this.logger.error('Failed to download file', error);
      return null;
    }
  }

  async delete(path: string) {
    try {
      await this.storage.bucket(this.bucket).file(path).delete();
    } catch (error) {
      this.logger.warn('Failed to delete file', error);
    }
  }

  async deleteFolder(prefix: string) {
    try {
      const [files] = await this.storage.bucket(this.bucket).getFiles({ prefix });
      await Promise.all(files.map((file) => file.delete()));
    } catch (error) {
      this.logger.error('Failed to delete folder', error);
    }
  }

  getFileStream(path: string) {
    return this.storage.bucket(this.bucket).file(path);
  }

  async generateSignedUrl(path: string): Promise<string> {
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(path)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
    return url;
  }
}
