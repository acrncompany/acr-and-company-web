import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { paths } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { processImage } from './image-processor';

const log = new Logger('SeedImages');

/** Source images shipped in the repo (the same folder the content seed reads). */
const assetsDir = path.resolve(paths.backendRoot, process.env.SEED_ASSETS_DIR || 'prisma/seed-assets');

/**
 * Re-creates the seeded images (Media rows whose path starts with "seed/") from the source files in the repo when the
 * file is missing from UPLOAD_DIR. On a host with a disk that is wiped on every deploy/restart (Render free tier) the
 * Media rows survive in the database but the files do not; this puts them back before the server starts answering.
 * Uses the same processing as the seed, so the result is identical to what the seed wrote. Images uploaded later through
 * the admin have no source file in the repo and cannot be restored. Never throws: a failure must not stop the API.
 */
export async function restoreSeedImages(prisma: PrismaService): Promise<void> {
  try {
    const rows = await prisma.media.findMany({ where: { path: { startsWith: 'seed/' } }, select: { path: true } });
    const missing = rows.filter((r) => !fs.existsSync(path.join(paths.uploadDir, r.path)));
    if (!missing.length) return;

    const sources = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
    let restored = 0;
    for (const { path: rel } of missing) {
      const base = path.basename(rel, path.extname(rel));
      const file = sources.find((f) => path.basename(f, path.extname(f)) === base);
      if (!file) { log.warn(`No source file for ${rel} in ${assetsDir}; it stays missing.`); continue; }
      const src = path.join(assetsDir, file);
      const img = await processImage(fs.readFileSync(src), src);
      if (img.ext !== path.extname(rel)) { log.warn(`${rel}: processing gave ${img.ext}, expected ${path.extname(rel)}; skipped.`); continue; }
      const dest = path.join(paths.uploadDir, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, img.buffer);
      restored++;
    }
    log.log(`Restored ${restored} of ${missing.length} missing seed image(s) into ${paths.uploadDir}`);
  } catch (e) {
    log.error(`Could not restore seed images: ${(e as Error).message}`);
  }
}
