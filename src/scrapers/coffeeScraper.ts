import axios from 'axios';
import * as cheerio from 'cheerio';
import { MonthlyCoffeeReport, DailyCoffeeQuote } from '../types/coffee';

const SCRAPE_URL = 'https://www.cccv.org.br/cotacao/';

function parseBRL(value: string): number | null {
  if (!value || value.trim() === '-') return null;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}

export async function scrapeCccvWebsite(year: number, month: number): Promise<MonthlyCoffeeReport | null> {
  console.log('Scraper: Acessando o site da CCCV...');
  try {
    const { data } = await axios.get(SCRAPE_URL);
    const $ = cheerio.load(data);

    const table = $('table.tabela.big');
    if (table.length === 0) {
      throw new Error('Tabela de cotações não encontrada na página.');
    }

    // Extração de Cabeçalhos e Safra
    const harvest = table.find('tr.tabela-title td[colspan="2"]').first().text().trim();
    const headerRow = table.find('tr.linha.impar').first();
    const headers: string[] = [];
    headerRow.find('td.vlinha').each((i, el) => {
      const headerText = $(el).text().trim().replace(/\s+/g, ' ');
      if (i > 0) headers.push(headerText);
    });
    
    const arabicaHeaders = headers.slice(0, 2);
    const conilonHeaders = headers.slice(2);

    // Extração de Cotações Diárias
    const dailyQuotes: DailyCoffeeQuote[] = [];
    table.find('tbody tr.linha').slice(1).each((_, row) => {
      const cells = $(row).find('td.vlinha');
      const dayStr = $(cells[0]).text().trim();
      if (dayStr.toLowerCase().includes('média')) return;
      
      const day = parseInt(dayStr, 10);
      if (isNaN(day)) return;

      dailyQuotes.push({
        day,
        arabica: arabicaHeaders.map((desc, i) => ({
          description: desc,
          value: parseBRL($(cells[i + 1]).text()),
        })),
        conilon: conilonHeaders.map((desc, i) => ({
          description: desc,
          value: parseBRL($(cells[i + 3]).text()),
        })),
      });
    });

    // Extração da Média Mensal
    const averageRow = table.find("tr.tabela-title:contains('Média Mensal')");
    const avgCells = averageRow.find('td.vlinha');
    const monthlyAverage = {
        arabica: [
            { description: arabicaHeaders[0], value: parseBRL($(avgCells[1]).text()) },
            { description: arabicaHeaders[1], value: parseBRL($(avgCells[2]).text()) }
        ],
        conilon: [
            { description: conilonHeaders[0], value: parseBRL($(avgCells[3]).text()) }
        ]
    };
    
    //
    const report: MonthlyCoffeeReport = {
      year,
      month,
      harvest,
      quotes: dailyQuotes,
      monthlyAverage,
      scrapedAt: new Date(),
    };
    
    console.log(`Scraper: Extração finalizada com sucesso.`);
    return report;

  } catch (error) {
    console.error('Scraper: Ocorreu um erro ao extrair os dados.', error);
    return null;
  }
}