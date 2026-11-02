import { ImageRef } from './site';

/** Typed shapes for the Learning Centre. Later this is the JSON the NestJS API returns. */

export interface LearningHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

/** One piece of article body. Rendered in order. */
export type ArticleBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

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
  body: ArticleBlock[];
}

export interface LearningPageContent {
  hero: LearningHeroContent;
  /** Label of the filter tab that shows every article. */
  allLabel: string;
  /** Filter tabs, in display order. */
  categories: string[];
  /** Newest first. */
  articles: LearningArticle[];
  readLabel: string;
  backToCentreLabel: string;
  backToArticlesLabel: string;
}
