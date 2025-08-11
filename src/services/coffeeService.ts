import { scrapeLatestCoffeeQuote } from "../scrapers/coffeeScraper";
import {
  saveLatestCoffeeQuote,
  getLatestCoffeeQuote,
} from "../database/firestoreService";
import { LatestCoffeeData } from "../types/coffee";

export async function updateCoffeeQuotesData(): Promise<void> {
  const data = await scrapeLatestCoffeeQuote();

  if (data) {
    await saveLatestCoffeeQuote(data);
    console.log("Atualização da cotação de café salva com sucesso.");
  } else {
    console.error("Falha ao obter dados da cotação de café.");
  }
}

export async function getLatestCoffeeQuoteService(): Promise<LatestCoffeeData | null> {
  console.log(`Serviço (CoffeeQuotes): Buscando última cotação.`);
  return await getLatestCoffeeQuote();
}
