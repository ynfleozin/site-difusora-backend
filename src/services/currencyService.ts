import { getLatestCurrencyQuotes } from "../database/firestoreService";
import { CurrencyQuotes } from "../types/currency";

export async function getCurrencyQuotes(): Promise<CurrencyQuotes | null> {
  console.log("Serviço de Moedas: Buscando cotações do Firestore...");

  try {
    const quotes = await getLatestCurrencyQuotes();
    return quotes;
  } catch (error) {
    console.error("Erro no serviço ao buscar cotações de moedas: ", error);
    return null;
  }
}
