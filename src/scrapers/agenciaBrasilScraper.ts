import Parser from "rss-parser";
import type { NewsArticle } from "../types/news";

const rssFeedUrls = {
  nacional: "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml",
  politica: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml",
  economia: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml",
  esportes: "https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml",
};

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  creator?: string;
  enclosure?: { url: string };
  category?: { _: string };
};

const parser = new Parser<object, FeedItem>({});

export async function scrapeAgenciaBrasil(): Promise<NewsArticle[]> {
  console.log("Iniciando scraping da Agência Brasil...");
  const allArticles: NewsArticle[] = [];
  const processedUrls = new Set<string>();

  for (const [category, feedUrl] of Object.entries(rssFeedUrls)) {
    try {
      console.log(`Processando feed: ${category}...`);
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        const contentHTML = item.content;
        if (
          !item.link ||
          processedUrls.has(item.link) ||
          !item.title ||
          !contentHTML
        ) {
          continue;
        }

        const finalCategory = item.category ? item.category._ : category;

        const formattedCategory =
          finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1);

        allArticles.push({
          title: item.title,
          contentHTML: contentHTML,
          sourceUrl: item.link,
          sourceName: "Agência Brasil",
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          imageUrl: item.enclosure?.url,
          author: item.creator,
          category: formattedCategory,
        });
        processedUrls.add(item.link);
      }
    } catch (error) {
      console.error(`Erro ao processar o feed RSS de ${category}:`, error);
      continue;
    }
  }
  console.log(
    `Scraping da Agência Brasil finalizado. ${allArticles.length} artigos únicos encontrados`
  );
  return allArticles;
}
