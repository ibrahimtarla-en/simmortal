import { Request } from 'express';
import { createHash } from 'crypto';

export function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  return (
    (req.headers['x-appengine-remote-addr'] as string) ||
    (forwarded && forwarded.split(',')[0].trim()) ||
    (req.headers['x-real-ip'] as string) ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

export function hashIP(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.IP_SALT)
    .digest('hex');
}
