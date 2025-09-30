import Parser from "rss-parser";
import type { NewsArticle } from "../types/news";
import * as cheerio from "cheerio";

const rssFeedUrls = {
  geral: "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml",
  internacional: "https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml",
  politica: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml",
  economia: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml",
  educacao: "https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml",
  esportes: "https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml",
  saude: "https://agenciabrasil.ebc.com.br/rss/saude/feed.xml",
  "meio-ambiente":
    "https://agenciabrasil.ebc.com.br/rss/meio-ambiente/feed.xml",
  "direitos-humanos":
    "https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml",
  cultura: "https://agenciabrasil.ebc.com.br/rss/cultura/feed.xml",
  justica: "https://agenciabrasil.ebc.com.br/rss/justica/feed.xml",
};

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  creator?: string;
  enclosure?: { url: string };
  category?: { _: string };
  "imagem-destaque"?: string;
};

const parser = new Parser<object, FeedItem>({
  customFields: {
    item: ["imagem-destaque"],
  },
});

export async function scrapeAgenciaBrasil(): Promise<NewsArticle[]> {
  console.log("Iniciando scraping da Agência Brasil...");
  const allArticles: NewsArticle[] = [];
  const processedUrls = new Set<string>();

  for (const [category, feedUrl] of Object.entries(rssFeedUrls)) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        const rawContentHTML = item.content;
        if (
          !item.link ||
          processedUrls.has(item.link) ||
          !item.title ||
          !rawContentHTML
        ) {
          continue;
        }

        const imageUrl = item.enclosure?.url || item["imagem-destaque"];

        if (!imageUrl) {
          console.log(`- Notícia pulada (sem imagem): "${item.title}"`);
          continue;
        }

        const $ = cheerio.load(rawContentHTML);

        $('h3:contains("Notícias relacionadas:")').next("ul").remove();
        $('h3:contains("Notícias relacionadas:")').remove();
        $("a:contains('Siga o perfil')").closest("p").remove();
        $("img[src*='logo-agenciabrasil.svg']").closest("p").remove();
        $("img[src*='ebc.png']").remove();
        $("img[src*='ebc.gif']").remove();
        $("a[href*='whatsapp.com/channel']").closest("p").remove();

        const cleanedBodyContent = $.html();

        const description = cleanedBodyContent
          ? cheerio.load(cleanedBodyContent).text().substring(0, 200).trim() +
          "..."
          : undefined;

        const finalCategory = item.category ? item.category._ : category;

        const formattedCategory =
          finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1);

        allArticles.push({
          title: item.title,
          body: cleanedBodyContent,
          sourceUrl: item.link,
          sourceName: "Agência Brasil",
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          imageUrl: imageUrl, 
          author: item.creator || null,
          category: formattedCategory,
          description: description,
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