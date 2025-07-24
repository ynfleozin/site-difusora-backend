import { scrapeCccvWebsite } from "../scrapers/coffeeScraper";
import {
  saveCoffeeReport,
  getCoffeeReport,
} from "../database/firestoreService";

export async function updateCoffeeQuotesData(): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const report = await scrapeCccvWebsite(year, month);

  if (report) {
    await saveCoffeeReport(report);
    console.log("Atualização salva para:", year, month);
  } else {
    console.error("Falha ao obter dados.");
  }
}

export async function getMonthlyCoffeeReport(year: number, month: number) {
  console.log(
    `Serviço (CoffeeQuotes): Buscando relatório para ${year}-${month}.`
  );
  return await getCoffeeReport(year, month);
}
