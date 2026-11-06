-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "facebookUrl" VARCHAR(500) NOT NULL DEFAULT '',
ADD COLUMN     "instagramUrl" VARCHAR(500) NOT NULL DEFAULT '',
ADD COLUMN     "linkedinUrl" VARCHAR(500) NOT NULL DEFAULT '';

-- Carry over any links already saved in the old SocialLink table
UPDATE "SiteSettings" SET "facebookUrl" = COALESCE((SELECT "url" FROM "SocialLink" WHERE "platform" = 'facebook' AND "visible" ORDER BY "sortOrder" LIMIT 1), '');
UPDATE "SiteSettings" SET "instagramUrl" = COALESCE((SELECT "url" FROM "SocialLink" WHERE "platform" = 'instagram' AND "visible" ORDER BY "sortOrder" LIMIT 1), '');
UPDATE "SiteSettings" SET "linkedinUrl" = COALESCE((SELECT "url" FROM "SocialLink" WHERE "platform" = 'linkedin' AND "visible" ORDER BY "sortOrder" LIMIT 1), '');
