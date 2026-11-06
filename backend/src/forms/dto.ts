import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Same rule as the website's forms (a phone number: optional +, 8-15 digits, spaces and dashes allowed). */
const PHONE = /^\+?[\d\s-]{8,15}$/;
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/**
 * `website` is the honeypot: the forms contain an input with this name that people never see. A person leaves it empty,
 * a bot that fills in every field does not. Such a request is answered as if it worked, and is thrown away.
 */
export class HoneypotDto {
  @IsOptional() @IsString() @MaxLength(500) website?: string;
}

export class ContactDto extends HoneypotDto {
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(150) name: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(150) company?: string;
  @Transform(trim) @IsEmail() @MaxLength(200) email: string;
  @Transform(trim) @Matches(PHONE) phone: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(200) service?: string;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(5000) message: string;
}

export class ConsultationDto extends HoneypotDto {
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(150) name: string;
  @Transform(trim) @Matches(PHONE) phone: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(200) service?: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(100) preferredTime?: string;
}

export class ApplicationDto extends HoneypotDto {
  /** The slug of the position, as in /careers/<slug>. */
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(220) jobSlug: string;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(150) name: string;
  @Transform(trim) @IsEmail() @MaxLength(200) email: string;
  @Transform(trim) @Matches(PHONE) phone: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(3000) message?: string;
}
