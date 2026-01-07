/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { verifySession } from 'supertokens-node/recipe/session/framework/express'; // or fastify
import type { Request, Response } from 'express';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { PublicAccess } from 'supertokens-nestjs';

@Injectable()
class OptionalSessionGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { session?: SessionContainer }>();
    const res = ctx.switchToHttp().getResponse<Response>();

    return new Promise((resolve) => {
      void verifySession({ sessionRequired: false })(req as any, res as any, (err?: any) => {
        if (err) return resolve(true);
        resolve(true);
      });
    });
  }
}

export const PublicWithOptionalSession = () =>
  applyDecorators(
    PublicAccess(), // skips your global “require auth” guard (no 401)
    UseGuards(OptionalSessionGuard), // still runs verifySession({ sessionRequired:false })
  );
