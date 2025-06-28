export interface NewsArticle {
    title: string;
    contentHTML: string;
    sourceUrl: string;
    sourceName: string;
    publishedAt: Date;
    imageUrl?: string;
}