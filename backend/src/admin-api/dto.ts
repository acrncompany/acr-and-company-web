/**
 * Validation classes (class-validator) for every admin resource.
 * "Create" classes list required fields; "Update" classes are the same with everything optional (PartialType).
 * Unknown fields are stripped by the ValidationPipe (whitelist).
 */
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min,
} from 'class-validator';
import { FeatureGroup, IndustryTone, MenuLocation, StatGroup, Status } from '@prisma/client';

// ---- small reusable decorators
/** Surrounding spaces are removed before validation, so "   " counts as empty. */
const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const Required = (max: number) => applyDecorators(Trim(), IsString(), IsNotEmpty(), MaxLength(max));
const Optional = (max: number) => applyDecorators(Trim(), IsOptional(), IsString(), MaxLength(max));
const OptionalInt = () => applyDecorators(IsOptional(), IsInt(), Min(0));
const OptionalBool = () => applyDecorators(IsOptional(), IsBoolean());
const OptionalStatus = () => applyDecorators(IsOptional(), IsEnum(Status));
/** Only relative links, http(s), mailto: and tel: (blocks javascript: URLs). */
const LinkUrl = () => applyDecorators(IsString(), MaxLength(300), Matches(/^(\/|#|https?:\/\/|mailto:|tel:)/, { message: 'must be a link such as /contact or https://...' }));
/** Name of an icon in the website's icon set, e.g. "shield-check". */
const IconName = () => applyDecorators(Trim(), IsString(), MaxLength(60), Matches(/^[a-z0-9-]+$/, { message: 'icon must be an icon name such as "shield-check"' }));
const OptionalIcon = () => applyDecorators(IsOptional(), IconName());
const MediaRef = () => applyDecorators(IsOptional(), IsInt(), Min(1)); // id of a Media row (null clears it)
const Slug = (max: number) => Optional(max); // left empty = generated from the title

class SeoFields {
  @Optional(200) metaTitle?: string;
  @Optional(400) metaDescription?: string;
  @MediaRef() ogImageId?: number;
}

// ---- menus

export class MenuItemDto {
  @IsEnum(MenuLocation) location: MenuLocation;
  @Required(100) label: string;
  @LinkUrl() url: string;
  @OptionalBool() exact?: boolean;
  @OptionalBool() isMegaMenu?: boolean;
  @OptionalBool() visible?: boolean;
  @OptionalInt() sortOrder?: number;
}
export class UpdateMenuItemDto extends PartialType(MenuItemDto) {}

// ---- fixed pages (SEO + CTA flag) and their content blocks (edit only)
export class UpdatePageDto extends SeoFields {
  @IsOptional() @Trim() @IsString() @IsNotEmpty() @MaxLength(200) title?: string;
  @OptionalBool() noindex?: boolean;
  @OptionalBool() showCta?: boolean;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 1 }) @Min(0) @Max(1) priority?: number;
}

export class UpdateBlockDto {
  @IsOptional() @IsString() @MaxLength(100000) value?: string;
  @MediaRef() mediaId?: number;
}

// ---- repeatable content
export class StatDto {
  @IsEnum(StatGroup) group: StatGroup;
  @Required(30) value: string;
  @Required(150) label: string;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateStatDto extends PartialType(StatDto) {}

export class FeatureItemDto {
  @IsEnum(FeatureGroup) group: FeatureGroup;
  @OptionalIcon() icon?: string;
  @Required(200) title: string;
  @IsString() @MaxLength(2000) body: string;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateFeatureItemDto extends PartialType(FeatureItemDto) {}

export class FaqDto {
  @Optional(50) pageKey?: string;
  @Required(300) question: string;
  @Required(3000) answer: string;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateFaqDto extends PartialType(FaqDto) {}

export class IndustryDto {
  @IconName() icon: string;
  @Required(100) label: string;
  @IsOptional() @IsEnum(IndustryTone) tone?: IndustryTone;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateIndustryDto extends PartialType(IndustryDto) {}

export class LocationDto {
  @Required(100) name: string;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateLocationDto extends PartialType(LocationDto) {}

export class TeamMemberDto {
  @Required(150) name: string;
  @Required(200) role: string;
  @Optional(200) qualifications?: string;
  @Required(5000) bio: string;
  @OptionalIcon() fallbackIcon?: string;
  @MediaRef() photoId?: number;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateTeamMemberDto extends PartialType(TeamMemberDto) {}

// ---- services
export class ServiceCategoryDto {
  @Required(150) title: string;
  @Slug(160) slug?: string;
  @IconName() icon: string;
  @Required(300) summary: string;
  @OptionalBool() showOnHome?: boolean;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateServiceCategoryDto extends PartialType(ServiceCategoryDto) {}

export class ServiceDto extends SeoFields {
  @IsInt() @Min(1) categoryId: number;
  @Required(200) title: string;
  @Slug(220) slug?: string;
  @Optional(200) menuLabel?: string;
  @Required(2000) description: string;
  @IsOptional() @IsString() @MaxLength(200000) body?: string;
  @OptionalBool() showInMenu?: boolean;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdateServiceDto extends PartialType(ServiceDto) {}

// ---- learning centre
export class PostCategoryDto {
  @Required(100) name: string;
  @Slug(120) slug?: string;
  @OptionalInt() sortOrder?: number;
}
export class UpdatePostCategoryDto extends PartialType(PostCategoryDto) {}

export class PostDto extends SeoFields {
  @IsInt() @Min(1) categoryId: number;
  @Required(250) title: string;
  @Slug(270) slug?: string;
  @Required(5000) excerpt: string;
  @IsString() @MaxLength(500000) body: string;
  @MediaRef() coverId?: number;
  @IsOptional() @IsDateString() publishedAt?: string;
  @IsOptional() @IsInt() @Min(1) @Max(600) readMinutes?: number;
  @OptionalBool() showOnHome?: boolean;
  @OptionalBool() isFeatured?: boolean;
  @OptionalStatus() status?: Status;
  @OptionalInt() sortOrder?: number;
}
export class UpdatePostDto extends PartialType(PostDto) {}

// ---- careers
export class DepartmentDto {
  @Required(150) name: string;
  @OptionalInt() sortOrder?: number;
}
export class UpdateDepartmentDto extends PartialType(DepartmentDto) {}

export class JobDto extends SeoFields {
  @IsOptional() @IsInt() @Min(1) departmentId?: number;
  @Required(200) title: string;
  @Slug(220) slug?: string;
  @Required(150) location: string;
  @Required(80) employmentType: string;
  @IsString() @MaxLength(200000) description: string;
  @IsOptional() @IsString() @MaxLength(200000) requirements?: string;
  @Optional(100) salary?: string;
  @IsOptional() @Trim() @IsEmail() @MaxLength(200) applyEmail?: string;
  @OptionalStatus() status?: Status;
  @IsOptional() @IsDateString() postedAt?: string;
  @IsOptional() @IsDateString() closingDate?: string;
  @OptionalInt() sortOrder?: number;
}
export class UpdateJobDto extends PartialType(JobDto) {}

// ---- site settings (single row)
export class UpdateSettingsDto {
  @IsOptional() @Required(200) siteName?: string;
  @IsOptional() @Required(200) brandName?: string;
  @IsOptional() @Required(300) tagline?: string;
  @IsOptional() @Required(250) legalName?: string;
  @IsOptional() @IsInt() @Min(1800) @Max(2200) foundingYear?: number;
  @IsOptional() @Required(500) description?: string;
  @MediaRef() logoId?: number;
  @MediaRef() faviconId?: number;

  @IsOptional() @Required(1000) addressLines?: string;
  @IsOptional() @Trim() @IsEmail() @MaxLength(200) contactEmail?: string;
  @IsOptional() @Required(50) contactPhone?: string;
  @IsOptional() @Matches(/^\+?[0-9]{6,20}$/, { message: 'must be digits with an optional leading +, e.g. +919447157549' }) contactPhoneRaw?: string;
  @IsOptional() @Required(500) businessHours?: string;
  @IsOptional() @Required(300) mapQuery?: string;
  @IsOptional() @Trim() @IsEmail() @MaxLength(200) careersEmail?: string;
  @IsOptional() @Trim() @IsEmail() @MaxLength(200) notificationEmail?: string;

  /** Country code + digits, e.g. 919XXXXXXXXX. Anything else (such as the seeded "[placeholder]") keeps the WhatsApp button hidden. */
  @IsOptional() @Required(30) whatsappNumber?: string;
  @IsOptional() @Required(500) whatsappMessage?: string;

  @IsOptional() @Required(200) ctaTitle?: string;
  @IsOptional() @Required(400) ctaText?: string;
  @IsOptional() @Required(100) ctaButtonLabel?: string;
  @IsOptional() @LinkUrl() ctaPath?: string;
  @IsOptional() @Required(100) headerButtonLabel?: string;
  @IsOptional() @LinkUrl() headerButtonUrl?: string;
  @IsOptional() @Required(2000) footerAbout?: string;
  @IsOptional() @Required(300) footerCopyright?: string;
  @IsOptional() @Required(500) footerTaglines?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(500) @Matches(/^(https?:\/\/\S+)?$/, { message: 'must be a full address starting with https://, or empty' }) facebookUrl?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(500) @Matches(/^(https?:\/\/\S+)?$/, { message: 'must be a full address starting with https://, or empty' }) instagramUrl?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(500) @Matches(/^(https?:\/\/\S+)?$/, { message: 'must be a full address starting with https://, or empty' }) linkedinUrl?: string;

  @IsOptional() @Required(200) titleSuffix?: string;
  @IsOptional() @Required(400) defaultMetaDescription?: string;
  @IsOptional() @IsString() @MaxLength(500) keywords?: string;
  @IsOptional() @Required(200) author?: string;
  @IsOptional() @IsString() @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'themeColor must look like #0a2342' }) themeColor?: string;
  @MediaRef() defaultOgImageId?: number;
  @IsOptional() @Required(300) orgStreet?: string;
  @IsOptional() @Required(100) orgLocality?: string;
  @IsOptional() @Required(100) orgRegion?: string;
  @IsOptional() @Required(20) orgPostalCode?: string;
  @IsOptional() @IsString() @Matches(/^[A-Z]{2}$/, { message: 'must be 2 capital letters, e.g. IN' }) orgCountryCode?: string;
}

// ---- media
export class MediaAltDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Alt text (a short description of the image) is required' }) @MaxLength(300) alt: string;
}
