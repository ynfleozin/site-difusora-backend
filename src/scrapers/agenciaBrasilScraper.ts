import axios from "axios";
import cheerio from "cheerio";
import Parser from "rss-parser";
import type { NewsArticle } from "../types/news";

const rssFeedUrls = {
  nacional: "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml",
  politica: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml",
  economia: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml",
  esportes: "https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml",
};

const parser = new Parser();

async function getFullArticleContent(articleUrl: string): Promise<string>{
    try{
        const {data: articleHtml} = await axios.get(articleUrl);
        const $ = cheerio.load(articleHtml);
        const contentHTML = $('div.body').html();
        return contentHTML || '';
    }catch(error){
        console.error(`Erro ao buscar conteúdo completo de ${articleUrl}`, error);
        return '';
    }
}

export async function scrapeAgenciaBrasil(): Promise<NewsArticle[]>{
    console.log('Iniciando scraping da Agência Brasil...');
    const allArticles: NewsArticle[] = [];
    const processedUrls = new Set<string>();

    for(const [category, feedUrl] of Object.entries(rssFeedUrls)){
        try{
            console.log(`Processando feed: ${category}...`);
            const feed = await parser.parseURL(feedUrl);
            const latestItems = feed.items.slice(0,3);

            for(const item of latestItems){
                if(!item.link || processedUrls.has(item.link)) continue;

                const contentHTML = await getFullArticleContent(item.link);
                if(!item.title || !contentHTML) continue;

                allArticles.push({
                    title: item.title,
                    contentHTML,
                    sourceUrl: item.link,
                    sourceName: 'Agência Brasil',
                    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    imageUrl: item.enclosure?.url,
                });
                processedUrls.add(item.link);
            }
        }catch(error){
            console.error(`Erro ao processar o feed RSS de ${category}:`, error);
            continue;
        }
    }
    console.log(`Scraping da Agência Brasil finalizado. ${allArticles.length} artigos únicos encontrados`);
    return allArticles;
}
