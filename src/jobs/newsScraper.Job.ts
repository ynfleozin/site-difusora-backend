import { scrapeCamara } from "../scrapers/camaraScraper";
import { scrapeAgenciaBrasil } from "../scrapers/agenciaBrasilScraper";
import { saveScrapedNews } from "../database/firestoreService";
import type { NewsArticle } from "../types/news";

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function runScrapingJob() {
  console.log("[JOB] Iniciando o job de scraping de notícias...");
  try {
    const [camaraNews, agenciaBrasilNews] = await Promise.all([
      scrapeCamara(),
      scrapeAgenciaBrasil(),
    ]);

    const allScrapedNews = [...camaraNews, ...agenciaBrasilNews];
    console.log(`[JOB] ${allScrapedNews.length} notícias encontradas pelos scrapers.`);

    if (allScrapedNews.length === 0) {
      console.log("[JOB] Nenhuma notícia nova para salvar.");
      return;
    }

    const savePromises = allScrapedNews.map((article) => {
      const articleWithSlug = {
        ...article,
        slug: article.slug || createSlug(article.title),
      };
      return saveScrapedNews(articleWithSlug);
    });

    await Promise.all(savePromises);
    console.log("[JOB] Job de scraping concluído com sucesso.");

  } catch (error) {
    console.error("[JOB] Erro durante a execução do job de scraping:", error);
  }
}