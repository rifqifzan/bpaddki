import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

/**
 * Applies the same HTTP hardening and routing configuration in production and
 * in e2e tests, so tests exercise the real middleware stack.
 */
export function configureApp(
  app: INestApplication,
  configService: ConfigService,
): void {
  const expressApp = app.getHttpAdapter().getInstance() as {
    disable: (setting: string) => void;
  };
  expressApp.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://validator.swagger.io'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: null,
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  app.use((request: Request, response: Response, next: NextFunction): void => {
    const incomingRequestId = request.header('x-request-id');
    request.id =
      incomingRequestId && REQUEST_ID_PATTERN.test(incomingRequestId)
        ? incomingRequestId
        : randomUUID();

    response.setHeader('x-request-id', request.id);
    next();
  });

  const origins = configService.get<string[]>('security.corsOrigins') ?? ['*'];

  app.enableCors({
    origin: origins.includes('*') ? true : origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'X-API-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: false,
    maxAge: 86_400,
  });

  app.setGlobalPrefix(configService.get<string>('apiPrefix') ?? 'api/v1');
}
