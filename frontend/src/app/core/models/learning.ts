import { ImageRef } from './site';

/** Typed shapes for the Learning Centre (the JSON the NestJS API returns). */

export interface LearningHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

/** An article as listed (no body). */
export interface LearningArticle {
  /** The last part of the URL: /learning/<slug>. */
  slug: string;
  /** One of LearningPageContent.categories. */
  category: string;
  title: string;
  excerpt: string;
  image: ImageRef;
  /** ISO date (yyyy-MM-dd). */
  publishedAt: string;
  readMinutes: number;
  path: string;
}

/** One article with its body: sanitised HTML written in the admin's rich-text editor. */
export interface LearningArticleDetail extends LearningArticle {
  body: string;
}

export interface LearningPageContent {
  hero: LearningHeroContent;
  /** Label of the filter tab that shows every article. */
  allLabel: string;
  /** Filter tabs, in display order. */
  categories: string[];
  /** Newest first, without bodies. */
  articles: LearningArticle[];
  readLabel: string;
  backToCentreLabel: string;
  backToArticlesLabel: string;
}
