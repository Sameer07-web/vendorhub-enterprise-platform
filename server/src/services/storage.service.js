const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);

class LocalStorageProvider {
  constructor() {
    this.basePath = path.join(__dirname, '../../uploads/reports');
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      if (!fs.existsSync(this.basePath)) {
        await mkdir(this.basePath, { recursive: true });
      }
    } catch (err) {
      console.error('[StorageService] Error creating uploads directory:', err);
    }
  }

  async uploadFile(filename, streamOrBuffer) {
    await this.ensureDirectoryExists();
    const filePath = path.join(this.basePath, filename);

    if (Buffer.isBuffer(streamOrBuffer)) {
      await promisify(fs.writeFile)(filePath, streamOrBuffer);
    } else {
      // It's a stream
      return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        streamOrBuffer.pipe(writeStream);
        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
      });
    }
    
    // Return a relative URL path that the frontend can download from
    return `/uploads/reports/${filename}`;
  }

  async deleteFile(filename) {
    const filePath = path.join(this.basePath, filename);
    if (fs.existsSync(filePath)) {
      await promisify(fs.unlink)(filePath);
    }
  }
}

class StorageService {
  constructor() {
    // We can swap this out for S3StorageProvider based on process.env in the future
    this.provider = new LocalStorageProvider();
  }

  async uploadReport(filename, streamOrBuffer) {
    return this.provider.uploadFile(filename, streamOrBuffer);
  }

  async deleteReport(filename) {
    return this.provider.deleteFile(filename);
  }
}

module.exports = new StorageService();
