import axios from "axios";
import * as cheerio from "cheerio";
import { DailyCoffeeQuote, LatestCoffeeData } from "../types/coffee";

const SCRAPE_URL = "https://www.cccv.org.br/cotacao/";

function parseBRL(value: string): number | null {
  if (!value || value.trim() === "-") return null;
  return parseFloat(value.replace(/\./g, "").replace(",", "."));
}

export async function scrapeLatestCoffeeQuote(): Promise<LatestCoffeeData | null> {
  console.log("Scraper: Acessando o site da CCCV para a última cotação...");
  try {
    const { data } = await axios.get(SCRAPE_URL);
    const $ = cheerio.load(data);

    const table = $("table.tabela.big");
    if (table.length === 0) {
      throw new Error("Tabela de cotações não encontrada.");
    }

    const harvest = table
      .find('tr.tabela-title td[colspan="2"]')
      .first()
      .text()
      .trim();
    const headerRow = table.find("tr.linha.impar").first();
    const headers: string[] = [];
    headerRow.find("td.vlinha").each((i, el) => {
      const headerText = $(el).text().trim().replace(/\s+/g, " ");
      if (i > 0) headers.push(headerText);
    });

    const arabicaHeaders = headers.slice(0, 2);
    const conilonHeaders = headers.slice(2);

    let latestValidQuote: DailyCoffeeQuote | null = null;

    table
      .find("tbody tr.linha")
      .slice(1)
      .each((_, row) => {
        const cells = $(row).find("td.vlinha");
        const dayStr = $(cells[0]).text().trim();
        if (dayStr.toLowerCase().includes("média")) return;

        const day = parseInt(dayStr, 10);
        if (isNaN(day)) return;

        const currentQuote: DailyCoffeeQuote = {
          day,
          arabica: arabicaHeaders.map((desc, i) => ({
            description: desc,
            value: parseBRL($(cells[i + 1]).text()),
          })),
          conilon: conilonHeaders.map((desc, i) => ({
            description: desc,
            value: parseBRL($(cells[i + 3]).text()),
          })),
        };

        const hasValue =
          currentQuote.arabica.some((p) => p.value !== null) ||
          currentQuote.conilon.some((p) => p.value !== null);

        if (hasValue) {
          latestValidQuote = currentQuote;
        }
      });

    if (!latestValidQuote) {
      console.log("Scraper: Nenhuma cotação diária válida encontrada.");
      return null;
    }

    const report: LatestCoffeeData = {
      harvest,
      quote: latestValidQuote,
      scrapedAt: new Date(),
    };

    console.log(
      `Scraper: Extração da última cotação (Dia ${report.quote.day}) finalizada.`
    );

    return report;
  } catch (error) {
    console.error("Scraper: Ocorreu um erro ao extrair os dados.", error);
    return null;
  }
}
