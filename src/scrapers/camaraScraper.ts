import axios from "axios";
import * as cheerio from "cheerio";
import { config } from "../config/index";
import type { NewsArticle } from "../types/news";

const axiosOptions = {
  timeout: 25000, 
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  },
};

export async function scrapeCamara(): Promise<NewsArticle[]> {
  console.log("Iniciando scraping da Câmara dos Deputados...");

  try {
    const { data: listHtml } = await axios.get(
      config.sites.camara.url,
      axiosOptions
    );
    const $ = cheerio.load(listHtml);

    const articleLinks: string[] = [];
    $("h3.g-chamada__titulo a").each((_index, element) => {
      const link = $(element).attr("href");
      if (link) {
        articleLinks.push(link);
      }
    });

    if (articleLinks.length === 0) {
      console.log(
        "Nenhum link de artigo encontrado na página de listagem da Câmara."
      );
      return [];
    }

    const articles: NewsArticle[] = [];

    for (const link of articleLinks) {
      const { data: articleHtml } = await axios.get(link, axiosOptions);
      const $$ = cheerio.load(articleHtml);

      const title = $$("article#content-noticia h1.g-artigo__titulo")
        .text()
        .trim();
      const articleBody = $$("div.g-artigo__texto-principal");

      articleBody.find("aside.l-acoes-apoio").remove();
      articleBody.find("p:contains('Da Redação')").remove();
      articleBody.find("p:contains('Reportagem')").remove();

      const bodyContent = articleBody.html();

      if (title && bodyContent) {
        const publishedAtText = $$("p.g-artigo__data-hora").text();
        const dateTimeRegex = /(\d{2}\/\d{2}\/\d{4}).*?(\d{2}:\d{2})/;
        const match = publishedAtText.match(dateTimeRegex);
        const category = $$("span.g-artigo__categoria").text().trim();
        const imageUrl = $$("div.image-container img").attr("src");

        let publishedAt = new Date();

        if (match && match[1] && match[2]) {
          const datePart = match[1];
          const timePart = match[2];
          const dateParts = datePart.split("/");
          const isoDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timePart}:00`;
          publishedAt = new Date(isoDateString);
        }

        let description = "";
        const firstParagraph = articleBody
          .find("p")
          .filter((_, el) => $$(el).text().trim().length > 20)
          .first();

        if (firstParagraph.length > 0) {
          description = $$(firstParagraph).text().trim();
          if (description.length > 150) {
            description = description.substring(0, 150).trim() + "...";
          }
        }

        articles.push({
          title,
          body: bodyContent,
          publishedAt,
          sourceUrl: link,
          sourceName: "Câmara dos Deputados",
          category: category,
          imageUrl: imageUrl,
          description: description,
          author: null,
        });
      }
    }

    console.log(
      `Scraping da Câmara finalizado. ${articles.length} artigos encontrados.`
    );
    return articles;
  } catch (error) {
    console.error("Erro ao fazer scraping da Câmara:", error);
    return [];
  }
}