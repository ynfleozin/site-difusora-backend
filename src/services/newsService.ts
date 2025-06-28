import { scrapeCamara } from "../scrapers/camaraScraper";
import { scrapeAgenciaBrasil } from "../scrapers/agenciaBrasilScraper";
import { getCache, setCache } from "../cache/cacheManager";
import type { NewsArticle } from "../types/news";

export async function getAggregatedNews(): Promise<NewsArticle[]> {
  //Acessa as notícias do cache primeiro
  const cachedNews = await getCache();
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

  await setCache(allNews);

  console.log(
    `Serviço: Total de ${allNews.length} notícias agregadas e ordenadas.`
  );
  return allNews;
}
