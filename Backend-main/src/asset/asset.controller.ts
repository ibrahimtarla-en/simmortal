import { Controller, Get, Param, Res, Req, NotFoundException } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { Response, Request } from 'express';
import { PublicAccess } from 'supertokens-nestjs';

@Controller('asset')
export class AssetController {
  constructor(private readonly storageService: StorageService) {}

  @PublicAccess()
  @Get('*path')
  async streamAsset(@Param('path') wild: string[], @Req() req: Request, @Res() res: Response) {
    const filePath = wild.join('/');
    const file = this.storageService.getFileStream(filePath);

    try {
      const [metadata] = await file.getMetadata();
      const fileSize = parseInt(metadata.size as string);
      const contentType = metadata.contentType || 'application/octet-stream';

      const isVideo = contentType.startsWith('video/');
      const range = req.headers.range;

      if (isVideo && range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        // CRITICAL: Keep connection alive for streaming
        res.setHeader('Connection', 'keep-alive');

        const stream = file.createReadStream({
          start,
          end,
        });

        stream.on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            res.status(500).end();
          }
        });

        stream.on('end', () => {
          res.end();
        });

        stream.pipe(res);
      } else {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', fileSize);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Connection', 'keep-alive');

        if (isVideo) {
          res.setHeader('Accept-Ranges', 'bytes');
        }

        const stream = file.createReadStream();

        stream.on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            res.status(500).end();
          }
        });

        stream.on('end', () => {
          res.end();
        });

        stream.pipe(res);
      }
    } catch (err) {
      console.log(err);
      throw new NotFoundException('Asset not found or inaccessible');
    }
  }
}
