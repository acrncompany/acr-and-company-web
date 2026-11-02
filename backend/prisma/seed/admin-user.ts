/**
 * Creates the first admin account from backend/.env (ADMIN_EMAIL, ADMIN_PASSWORD, optional ADMIN_NAME).
 * No credentials are written in code. Safe to re-run: it does nothing if an admin already exists.
 *
 * Run:   npm run seed:admin
 * Afterwards you can delete ADMIN_PASSWORD from .env and change the password in the admin (Account).
 */
import '../../src/config/load-env';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Administrator';

  if ((await prisma.adminUser.count()) > 0) {
    console.log('An admin account already exists. Nothing to do. (Forgot the password? Use `npm run admin:reset-password`.)');
    return;
  }
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first (see .env.example).');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('ADMIN_EMAIL is not a valid email address.');
  if (password.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');

  await prisma.adminUser.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`Admin account created for ${email}. You can now remove ADMIN_PASSWORD from .env.`);
}

main()
  .catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());
