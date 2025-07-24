import {
  saveLocalNews,
  getAllLocalNews,
  getNewsBySlugFromFirestore,
  getAllScrapedNews,
} from "../database/firestoreService";
import type { NewsArticle } from "../types/news";

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function getAggregatedNews(): Promise<NewsArticle[]> {
  console.log("Serviço: Buscando notícias agregadas do Firestore...");

  const [localNews, scrapedNews] = await Promise.all([
    getAllLocalNews(),
    getAllScrapedNews(), 
  ]);

  const allNews = [...localNews, ...scrapedNews];

  allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const newsWithSlugs = allNews.map((article) => ({
    ...article,
    slug: article.slug || createSlug(article.title),
  }));

  console.log(
    `Serviço: Total de ${newsWithSlugs.length} notícias retornadas do banco de dados.`
  );
  return newsWithSlugs;
}

export async function getArticleBySlug(
  slug: string
): Promise<NewsArticle | undefined> {
  console.log(`Serviço: Buscando artigo pelo slug "${slug}" diretamente no Firestore.`);
  return await getNewsBySlugFromFirestore(slug);
}

export async function getNewsByCategory(
  category: string
): Promise<NewsArticle[]> {
  const allNews = await getAggregatedNews(); 
  return allNews.filter(
    (article) =>
      article.category &&
      article.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getAvailableCategories(): Promise<string[]> {
  const allNews = await getAggregatedNews(); 
  const uniqueCategories = [
    ...new Set(
      allNews.map((article) => article.category).filter(Boolean) as string[]
    ),
  ];
  return uniqueCategories.sort();
}

export async function getLocalNews(): Promise<NewsArticle[]> {
  console.log("Serviço: Buscando apenas notícias locais do Firestore...");
  const localNews = await getAllLocalNews();

  localNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  console.log(`Serviço: Encontradas ${localNews.length} notícias locais.`);
  return localNews;
}

export async function addLocalNewsArticle(
  newArticleData: Omit<NewsArticle, "id">
): Promise<NewsArticle> {
  const publishedAtDate = newArticleData.publishedAt
    ? new Date(newArticleData.publishedAt)
    : new Date();

  const articleToSave: NewsArticle = {
    ...newArticleData,
    publishedAt: publishedAtDate,
    slug: newArticleData.slug || createSlug(newArticleData.title),
    author: newArticleData.author || null,
    sourceName: "Local",
    sourceUrl: "",
  };

  const savedArticle = await saveLocalNews(articleToSave);

  console.log(
    "Notícia local adicionada no Firestore e cache invalidado:",
    savedArticle
  );
  return savedArticle;
}
