export interface NewsArticle {
  title: string;
  body: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  imageUrl?: string;
  author?: string | null;
  category?: string;
  slug?: string;
  description?: string;
}
