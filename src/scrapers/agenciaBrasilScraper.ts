import Parser from "rss-parser";
import type { NewsArticle } from "../types/news";
import * as cheerio from 'cheerio';

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
  'imagem-destaque'?: string;
};

const parser = new Parser<object, FeedItem>({
  customFields: {
    item: ['imagem-destaque'],
  }
});

export async function scrapeAgenciaBrasil(): Promise<NewsArticle[]> {
  console.log("Iniciando scraping da Agência Brasil...");
  const allArticles: NewsArticle[] = [];
  const processedUrls = new Set<string>();

  for (const [category, feedUrl] of Object.entries(rssFeedUrls)) {
    try {
      console.log(`Processando feed: ${category}...`);
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

        // --- INÍCIO DA LÓGICA DE LIMPEZA INTELIGENTE ---
        const $ = cheerio.load(rawContentHTML); // Carregamos o HTML no Cheerio

        // Removemos os elementos indesejados usando seus seletores
        $('h3:contains("Notícias relacionadas:")').next('ul').remove(); // Remove a lista <ul> que vem depois do h3
        $('h3:contains("Notícias relacionadas:")').remove(); // Remove o próprio <h3>
        $("a:contains('Siga o perfil')").closest('p').remove(); // Remove o parágrafo inteiro com o link para seguir
        $("img[src*='logo-agenciabrasil.svg']").closest('p').remove(); // Remove o parágrafo com o logo
        $("img[src*='ebc.png']").remove(); // Remove os pixels de rastreamento
        $("img[src*='ebc.gif']").remove();

        // Extraímos o HTML que sobrou após a limpeza
        const cleanedContentHTML = $.html();

        // --- FIM DA LÓGICA DE LIMPEZA ---

        const finalCategory = item.category ? item.category._ : category;

        const formattedCategory =
          finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1);

        allArticles.push({
          title: item.title,
          contentHTML: cleanedContentHTML,
          sourceUrl: item.link,
          sourceName: "Agência Brasil",
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          imageUrl: item.enclosure?.url || item['imagem-destaque'],
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
