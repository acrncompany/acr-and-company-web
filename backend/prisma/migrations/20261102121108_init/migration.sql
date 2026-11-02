-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MenuLocation" AS ENUM ('HEADER', 'FOOTER');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEXT', 'TEXTAREA', 'RICHTEXT', 'IMAGE', 'LINK');

-- CreateEnum
CREATE TYPE "StatGroup" AS ENUM ('HOME_HERO', 'ABOUT_STORY');

-- CreateEnum
CREATE TYPE "FeatureGroup" AS ENUM ('HOME_WHY_CHOOSE', 'HOME_APPROACH', 'ABOUT_VALUE', 'CAREER_PERK');

-- CreateEnum
CREATE TYPE "IndustryTone" AS ENUM ('BLUE', 'AMBER', 'GREEN', 'VIOLET', 'ROSE', 'ORANGE', 'TEAL', 'SLATE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('CONTACT', 'CONSULTATION');

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "alt" VARCHAR(300) NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" VARCHAR(200) NOT NULL,
    "brandName" VARCHAR(200) NOT NULL,
    "tagline" VARCHAR(300) NOT NULL,
    "legalName" VARCHAR(250) NOT NULL,
    "foundingYear" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "logoId" INTEGER,
    "faviconId" INTEGER,
    "addressLines" TEXT NOT NULL,
    "contactEmail" VARCHAR(200) NOT NULL,
    "contactPhone" VARCHAR(50) NOT NULL,
    "contactPhoneRaw" VARCHAR(30) NOT NULL,
    "businessHours" TEXT NOT NULL,
    "mapQuery" VARCHAR(300) NOT NULL,
    "careersEmail" VARCHAR(200) NOT NULL,
    "notificationEmail" VARCHAR(200) NOT NULL,
    "whatsappNumber" VARCHAR(30) NOT NULL,
    "whatsappMessage" VARCHAR(500) NOT NULL,
    "ctaTitle" VARCHAR(200) NOT NULL,
    "ctaText" VARCHAR(400) NOT NULL,
    "ctaButtonLabel" VARCHAR(100) NOT NULL,
    "ctaPath" VARCHAR(300) NOT NULL,
    "headerButtonLabel" VARCHAR(100) NOT NULL,
    "headerButtonUrl" VARCHAR(300) NOT NULL,
    "footerAbout" TEXT NOT NULL,
    "footerCopyright" VARCHAR(300) NOT NULL,
    "footerTaglines" TEXT NOT NULL,
    "titleSuffix" VARCHAR(200) NOT NULL,
    "defaultMetaDescription" VARCHAR(400) NOT NULL,
    "keywords" VARCHAR(500) NOT NULL,
    "author" VARCHAR(200) NOT NULL,
    "themeColor" VARCHAR(20) NOT NULL,
    "defaultOgImageId" INTEGER,
    "orgStreet" VARCHAR(300) NOT NULL,
    "orgLocality" VARCHAR(100) NOT NULL,
    "orgRegion" VARCHAR(100) NOT NULL,
    "orgPostalCode" VARCHAR(20) NOT NULL,
    "orgCountryCode" VARCHAR(2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" SERIAL NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "location" "MenuLocation" NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "url" VARCHAR(300) NOT NULL,
    "exact" BOOLEAN NOT NULL DEFAULT false,
    "isMegaMenu" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "metaTitle" VARCHAR(200),
    "metaDescription" VARCHAR(400),
    "ogType" VARCHAR(30) NOT NULL DEFAULT 'website',
    "ogImageId" INTEGER,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "showCta" BOOLEAN NOT NULL DEFAULT true,
    "priority" DECIMAL(2,1) NOT NULL DEFAULT 0.5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" SERIAL NOT NULL,
    "pageKey" VARCHAR(50) NOT NULL,
    "blockKey" VARCHAR(100) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "help" VARCHAR(500) NOT NULL DEFAULT '',
    "type" "BlockType" NOT NULL DEFAULT 'TEXT',
    "value" TEXT NOT NULL DEFAULT '',
    "mediaId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" SERIAL NOT NULL,
    "group" "StatGroup" NOT NULL,
    "value" VARCHAR(30) NOT NULL,
    "label" VARCHAR(150) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureItem" (
    "id" SERIAL NOT NULL,
    "group" "FeatureGroup" NOT NULL,
    "icon" VARCHAR(60) NOT NULL DEFAULT '',
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FeatureItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" SERIAL NOT NULL,
    "pageKey" VARCHAR(50) NOT NULL DEFAULT 'home',
    "question" VARCHAR(300) NOT NULL,
    "answer" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" SERIAL NOT NULL,
    "icon" VARCHAR(60) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "tone" "IndustryTone" NOT NULL DEFAULT 'BLUE',
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "role" VARCHAR(200) NOT NULL,
    "qualifications" VARCHAR(200) NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL,
    "fallbackIcon" VARCHAR(60) NOT NULL DEFAULT 'graduation-cap',
    "photoId" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "icon" VARCHAR(60) NOT NULL,
    "summary" VARCHAR(300) NOT NULL,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "menuLabel" VARCHAR(200),
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "status" "Status" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" VARCHAR(200),
    "metaDescription" VARCHAR(400),
    "ogImageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(270) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverId" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "readMinutes" INTEGER,
    "showOnHome" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" VARCHAR(200),
    "metaDescription" VARCHAR(400),
    "ogImageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "employmentType" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL DEFAULT '',
    "salary" VARCHAR(100),
    "applyEmail" VARCHAR(200),
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" VARCHAR(200),
    "metaDescription" VARCHAR(400),
    "ogImageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER,
    "jobTitle" VARCHAR(200),
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(50),
    "message" TEXT,
    "cvFile" VARCHAR(300) NOT NULL,
    "cvOriginalName" VARCHAR(300) NOT NULL,
    "cvMimeType" VARCHAR(100) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "type" "MessageType" NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(200),
    "phone" VARCHAR(50),
    "service" VARCHAR(200),
    "message" TEXT,
    "preferredTime" VARCHAR(100),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "passwordHash" VARCHAR(200) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_path_key" ON "Media"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Page_key_key" ON "Page"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_pageKey_blockKey_key" ON "ContentBlock"("pageKey", "blockKey");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategory_slug_key" ON "PostCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_status_postedAt_idx" ON "Job"("status", "postedAt");

-- CreateIndex
CREATE INDEX "JobApplication_isRead_createdAt_idx" ON "JobApplication"("isRead", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_type_isRead_createdAt_idx" ON "ContactMessage"("type", "isRead", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_faviconId_fkey" FOREIGN KEY ("faviconId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_defaultOgImageId_fkey" FOREIGN KEY ("defaultOgImageId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
