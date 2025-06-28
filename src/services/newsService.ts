import { scrapeCamara } from "../scrapers/camaraScraper";
import type { NewsArticle } from "../types/news";

export async function getNews(): Promise<NewsArticle[]> {
  console.log("Serviço: Chamando o scraper da Câmara...");
  const camaraNews = await scrapeCamara();
  return camaraNews;
}