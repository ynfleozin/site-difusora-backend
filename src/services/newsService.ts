import { scrapeCamara } from "../scrapers/camaraScraper";
import { scrapeAgenciaBrasil } from "../scrapers/agenciaBrasilScraper";
import { getCache, setCache } from "../cache/cacheManager";
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
  //Acessa as notícias do cache primeiro
  const cachedNews = await getCache(CACHE_KEY, CACHE_TTL);
  if (cachedNews) {
    return cachedNews;
  }

  //Inicialização do Scraper caso não tenha cache válido
  console.log("Serviço: Buscando notícias de todas as fontes...");
  //Roda os scrapers em paralelo
  const [camaraNews, agenciaBrasilNews] = await Promise.all([
    scrapeCamara(),
    scrapeAgenciaBrasil(),
  ]);

  //Junta o retorno dos dois scrapers
  const allNews = [...camaraNews, ...agenciaBrasilNews];

  //Ordena o array por data de publicação
  allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  //Adiciona um slug em cada notícia
  const newsWithSlugs = allNews.map((article) => ({
    ...article,
    slug: createSlug(article.title),
  }));

  await setCache(CACHE_KEY, newsWithSlugs, CACHE_TTL);

  console.log(
    `Serviço: Total de ${newsWithSlugs.length} notícias agregadas e ordenadas.`
  );
  return newsWithSlugs;
}

export async function getArticleBySlug(
  slug: string
): Promise<NewsArticle | undefined> {
  const allNews = await getAggregatedNews();

  return allNews.find((article) => article.slug === slug);
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
