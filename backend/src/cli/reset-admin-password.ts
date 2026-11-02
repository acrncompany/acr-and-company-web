/**
 * Sets a new password for an admin (also logs that admin out everywhere, because sessions carry a password fingerprint).
 *
 *   npm run admin:reset-password -- --email admin@example.com --password "a new password, 10+ characters"
 */
import '../config/load-env';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg('email')?.trim().toLowerCase();
  const password = arg('password');
  if (!email || !password) throw new Error('Usage: npm run admin:reset-password -- --email <email> --password <new password>');
  if (password.length < 10) throw new Error('The password must be at least 10 characters.');
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) throw new Error(`No admin with the email ${email}.`);
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`Password updated for ${email}.`);
}

main()
  .catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());
