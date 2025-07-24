import axios from "axios";
import { saveCurrencyQuotes } from "../database/firestoreService";
import { CurrencyQuotes } from "../types/currency";

const API_URL =
  "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL";

export async function runCurrencyUpdateJob() {
  console.log("🚀 [JOB] Iniciando o job de atualização de cotações...");
  try {
    const response = await axios.get<CurrencyQuotes>(API_URL);
    const quotes = response.data;

    if (!quotes) {
      throw new Error("A API de cotações retornou uma resposta vazia.");
    }
    
    await saveCurrencyQuotes(quotes);
    
    console.log("✅ [JOB] Job de atualização de cotações concluído com sucesso.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error(`❌ [JOB] Erro durante a atualização de cotações: ${errorMessage}`);
  }
}