import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminApiModule } from './admin-api/admin-api.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './common/health.controller';
import { FormsModule } from './forms/forms.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { PublicModule } from './public/public.module';
import { FaviconController } from './seo/favicon.controller';
import { SeoController } from './seo/seo.controller';

@Module({
  imports: [
    // Rate limiting is opt-in per route (@UseGuards(ThrottlerGuard) + @Throttle): admin login and the public forms.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    MailModule,
    AuthModule,
    AdminApiModule,
    PublicModule,
    FormsModule,
  ],
  controllers: [SeoController, FaviconController, HealthController],
})
export class AppModule {}
