import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { restoreSeedImages } from './common/restore-seed-images';
import { env, paths } from './config/env';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind the hosting proxy: trust it so req.ip / rate limits / logs see the real client IP.
  const tp = env.trustProxy;
  app.set('trust proxy', /^\d+$/.test(tp) ? parseInt(tp, 10) : tp === 'true' ? true : tp === 'false' ? false : tp);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(compression());
  app.use(cookieParser());
  app.useBodyParser('json', { limit: '2mb' }); // rich-text bodies can be large
  // Validate every request body against its DTO class; unknown fields are dropped.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // The website (another origin in development) may read the public API. Never with credentials.
  if (env.corsOrigins.length) app.enableCors({ origin: env.corsOrigins, methods: ['GET'] });

  // Content is edited live in the admin, so nothing may be served stale. Admin responses are never stored. Public ones
  // are revalidated every time; do NOT use no-store/no-cache/private there: Angular then skips its transfer cache and
  // the browser would fetch everything again after the server-rendered page loads.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/admin')) res.setHeader('Cache-Control', 'no-store');
    else if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    next();
  });

  // Admin uploads live outside the app folder.
  fs.mkdirSync(paths.uploadDir, { recursive: true });
  app.useStaticAssets(paths.uploadDir, { prefix: '/uploads/', maxAge: 30 * 24 * 3600 * 1000, immutable: true, index: false });

  // The seeded images are rebuilt from the repo when the disk was wiped (Render free tier), before the first request.
  await restoreSeedImages(app.get(PrismaService));

  await app.listen(env.port);
  console.log(`ACR & Company API running on ${env.siteUrl} (port ${env.port})`);
}
bootstrap();
