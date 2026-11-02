import { Body, Controller, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { CV_MAX_BYTES } from './cv';
import { ApplicationDto, ConsultationDto, ContactDto } from './dto';
import { FormsService } from './forms.service';

/**
 * The three public forms. Protection, in order: rate limit (per visitor IP, checked first so an upload is never even read
 * when the limit is hit), honeypot field, server-side validation (class-validator DTOs; the CV is checked by its bytes).
 */
@Controller('api/public/forms')
@UseGuards(ThrottlerGuard)
export class FormsController {
  constructor(private readonly forms: FormsService) {}

  // 5 messages per 10 minutes per IP.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post('contact')
  @HttpCode(200)
  contact(@Body() dto: ContactDto) {
    return this.forms.contact(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post('consultation')
  @HttpCode(200)
  consultation(@Body() dto: ConsultationDto) {
    return this.forms.consultation(dto);
  }

  // 3 applications per 10 minutes per IP. multer answers 413 for a file above 5 MB.
  @Throttle({ default: { limit: 3, ttl: 600_000 } })
  @Post('application')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('cv', { storage: memoryStorage(), limits: { fileSize: CV_MAX_BYTES, files: 1, fields: 10, parts: 12 } }))
  application(@Body() dto: ApplicationDto, @UploadedFile() cv?: Express.Multer.File) {
    return this.forms.application(dto, cv);
  }
}
