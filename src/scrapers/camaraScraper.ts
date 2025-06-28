import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config/index';
import type { NewsArticle } from '../types/news';

export async function scrapeCamara(): Promise<NewsArticle[]> {
  console.log('Iniciando scraping da Câmara dos Deputados...');
  
  try {
    const { data: listHtml } = await axios.get(config.sites.camara.url);

    // Carrega HTML da página
    const $ = cheerio.load(listHtml);

    const articleLinks: string[] = [];

    // Seletor do link de cada notícia
    $('h3.g-chamada__titulo a').each((_index, element) => {
      const link = $(element).attr('href');
      if (link) {
        articleLinks.push(link);
      }
    });

    if (articleLinks.length === 0) {
      console.log('Nenhum link de artigo encontrado na página de listagem da Câmara.');
      return [];
    }

    const articles: NewsArticle[] = [];
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    };
    
    for (const link of articleLinks.slice(0, 5)) {
      console.log(`Buscando artigo em: ${link}`);
      const { data: articleHtml } = await axios.get(link, { headers });
      const $$ = cheerio.load(articleHtml);
      
      const title = $$('article#content-noticia h1.g-artigo__titulo').text().trim();
      
      const publishedAtText = $$('p.g-artigo__data-hora').text();
      
      const articleBody = $$('div.g-artigo__texto-principal');
      articleBody.find('aside.l-acoes-apoio').remove();
      articleBody.find("p:contains('Da Redação')").remove();
      articleBody.find("p:contains('Reportagem')").remove();
      const contentHTML = articleBody.html() || '';
      
      const dateString = publishedAtText.split('-')[0].trim();
      const dateParts = dateString.split('/');
      const publishedAt = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

      // Adiciona artigo
      if (title && contentHTML) {
        articles.push({
          title,
          contentHTML,
          publishedAt,
          sourceUrl: link,
          sourceName: 'Câmara dos Deputados',
        });
      }
    }

    console.log(`Scraping da Câmara finalizado. ${articles.length} artigos encontrados.`);
    return articles;

  } catch (error) {
    console.error('Erro ao fazer scraping da Câmara:', error);
    return []; // Retorna array vazio caso der erro
  }
}