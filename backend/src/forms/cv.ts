import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

export const CV_MAX_BYTES = 5 * 1024 * 1024;

/** The only CV types accepted. The type is decided by the file's own bytes, never by what the browser claims. */
const TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

export type CvExt = keyof typeof TYPES;

const startsWith = (buf: Buffer, bytes: number[]) => buf.length >= bytes.length && bytes.every((b, i) => buf[i] === b);

/** True when the content really is a file of that type. */
function matchesContent(ext: CvExt, buf: Buffer): boolean {
  if (ext === '.pdf') return startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
  if (ext === '.doc') return startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // old Office (OLE) file
  // .docx is a zip that contains a word/ folder
  return startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) && buf.includes('word/');
}

export interface CheckedCv {
  ext: CvExt;
  mimeType: string;
  /** The visitor's file name, made safe for storing and showing. */
  originalName: string;
}

/**
 * Throws a 400 with `code: 'cv_missing' | 'cv_invalid'` (the website turns the code into its message). Too large files
 * never get here: multer answers 413 first.
 */
export function checkCv(file: Express.Multer.File | undefined): CheckedCv {
  if (!file) throw new BadRequestException({ code: 'cv_missing', message: 'Please attach your CV.' });
  const ext = path.extname(file.originalname || '').toLowerCase() as CvExt;
  if (!(ext in TYPES) || file.size === 0 || file.size > CV_MAX_BYTES || !matchesContent(ext, file.buffer)) {
    throw new BadRequestException({ code: 'cv_invalid', message: 'The CV must be a PDF, DOC or DOCX file of up to 5 MB.' });
  }
  const base = path.basename(file.originalname.replace(/\\/g, '/'));
  // eslint-disable-next-line no-control-regex
  const originalName = base.replace(/[\u0000-\u001f\u007f"<>|:*?]/g, '_').slice(0, 200) || `cv${ext}`;
  return { ext, mimeType: TYPES[ext], originalName };
}
