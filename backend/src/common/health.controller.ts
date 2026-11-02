import { Controller, Get, Header, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * GET /health: liveness for the host's health check. Deliberately does NOT touch the database, so a probe every few
 * seconds does not keep a serverless database awake.
 * GET /health/ready: also checks the database connection (use it by hand, not as the automatic probe).
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async ready() {
    try {
      await this.prisma.siteSettings.count();
    } catch {
      throw new ServiceUnavailableException({ status: 'database unavailable' });
    }
    return { status: 'ok', database: 'ok' };
  }
}
