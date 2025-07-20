import { scrapeCamara } from "../scrapers/camaraScraper";
import { scrapeAgenciaBrasil } from "../scrapers/agenciaBrasilScraper";
import { getCache, setCache } from "../cache/cacheManager";

import {
  saveLocalNews,
  getAllLocalNews,
  saveScrapedNews,
  getNewsBySlugFromFirestore,
} from "../database/firestoreService";
import type { NewsArticle } from "../types/news";

const CACHE_KEY = "news";
const CACHE_TTL = 3600;

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function getAggregatedNews(): Promise<NewsArticle[]> {
  const cachedNews = await getCache(CACHE_KEY, CACHE_TTL);
  if (cachedNews) {
    console.log("[Cache] Servindo dados agregados do cache.");
    return cachedNews;
  }

  console.log("Serviço: Buscando notícias de todas as fontes...");

  const saveScrapedNewsInBackground = async (articles: NewsArticle[]) => {
    console.log(
      `Iniciando salvamento de ${articles.length} notícias em segundo plano.`
    );
    const savePromises = articles.map((article) => {
      const articleWithSlug = {
        ...article,
        slug: article.slug || createSlug(article.title),
      };
      return saveScrapedNews(articleWithSlug);
    });
    await Promise.all(savePromises);
    console.log("Salvamento em segundo plano concluído.");
  };

  const [localNews, camaraNewsScraped, agenciaBrasilNewsScraped] =
    await Promise.all([
      getAllLocalNews(),
      scrapeCamara(),
      scrapeAgenciaBrasil(),
    ]);

  const allScrapedNews = [...camaraNewsScraped, ...agenciaBrasilNewsScraped];

  if (allScrapedNews.length > 0) {
    saveScrapedNewsInBackground(allScrapedNews);
  }

  const allNews = [...localNews, ...allScrapedNews];

  allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const newsWithSlugs = allNews.map((article) => ({
    ...article,
    slug: article.slug || createSlug(article.title),
  }));

  await setCache(CACHE_KEY, newsWithSlugs, CACHE_TTL);

  console.log(
    `Serviço: Total de ${newsWithSlugs.length} notícias agregadas e retornadas.`
  );
  return newsWithSlugs;
}

export async function getArticleBySlug(
  slug: string
): Promise<NewsArticle | undefined> {
  // Tenta buscar no cache agregado primeiro
  const allNews = await getAggregatedNews();
  let article = allNews.find((a) => a.slug === slug);

  if (!article) {
    article = await getNewsBySlugFromFirestore(slug);
  }

  return article;
}

export async function getNewsByCategory(
  category: string
): Promise<NewsArticle[]> {
  const allNews = await getAggregatedNews();
  const filteredNews = allNews.filter(
    (article) =>
      article.category &&
      article.category.toLowerCase() === category.toLowerCase()
  );
  console.log(
    `Serviço: Encontradas ${filteredNews.length} notícias para a categoria "${category}".`
  );
  return filteredNews;
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
    id: "",
    publishedAt: publishedAtDate,
    slug: newArticleData.slug || createSlug(newArticleData.title),
    author: newArticleData.author || null,
    sourceName: "Local",
    sourceUrl: "",
  };

  const savedArticle = await saveLocalNews(articleToSave);

  await setCache(CACHE_KEY, null, 0);

  console.log(
    "Notícia local adicionada no Firestore e cache invalidado:",
    savedArticle
  );
  return savedArticle;
}
