import { Module } from '@nestjs/common';
import { ApplicationsController, InboxCountsController, MessagesController } from './inbox.controller';
import { MediaController } from './media.controller';
import { DashboardController, SeoPreviewController } from './misc.controller';
import { MediaService } from './media.service';
import { resourceControllers } from './resources';
import { SettingsController } from './settings.controller';

/** REST API for the Angular admin. Everything here lives under /api/admin and is login-protected by the global AdminGuard. */
@Module({
  controllers: [...resourceControllers, SettingsController, MediaController, InboxCountsController, MessagesController, ApplicationsController, DashboardController, SeoPreviewController],
  providers: [MediaService],
})
export class AdminApiModule {}
