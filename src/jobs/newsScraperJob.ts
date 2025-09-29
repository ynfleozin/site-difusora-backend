import { scrapeCamara } from "../scrapers/camaraScraper";
import { scrapeAgenciaBrasil } from "../scrapers/agenciaBrasilScraper";
import {
  saveScrapedNews,
  scrapedNewsCache,
  trimScrapedNewsByCategory,
} from "../database/firestoreService";

const NEWS_LIMIT_PER_CATEGORY = 20;

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
    console.log(
      `[JOB] ${allScrapedNews.length} notícias encontradas pelos scrapers.`
    );

    if (allScrapedNews.length === 0) {
      console.log("[JOB] Nenhuma notícia nova para salvar.");
      return;
    }

    const processedArticles = allScrapedNews.map((article) => ({
      ...article,
      slug: article.slug || createSlug(article.title),
      category: article.category?.toLowerCase() || "geral",
    }));

    const savePromises = processedArticles.map((article) =>
      saveScrapedNews(article)
    );
    await Promise.all(savePromises);
    console.log("[JOB] Todas as notícias novas foram salvas no Firestore.");

    const affectedCategories = [
      ...new Set(
        processedArticles
          .map((article) => article.category)
          .filter((category): category is string => !!category)
      ),
    ];

    if (affectedCategories.length > 0) {
      console.log(`[JOB] Categorias afetadas: ${affectedCategories.join(", ")}`);

      const trimPromises = affectedCategories.map((category) =>
        trimScrapedNewsByCategory(category, NEWS_LIMIT_PER_CATEGORY)
      );
      await Promise.all(trimPromises);
      console.log("[JOB] Verificação e limpeza de notícias antigas concluída.");
    }

    scrapedNewsCache.clear();

    console.log("✅ [JOB] Job de scraping concluído com sucesso!");
  } catch (error) {
    console.error("❌ [JOB] Erro durante a execução do job de scraping:", error);
  }
}