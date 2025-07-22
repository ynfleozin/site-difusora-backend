import axios from "axios";

const CACHE_KEY = "currencies";
const CACHE_TTL = 300;

const API_URL =
  "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL";

export async function getCurrencyQuotes(): Promise<any | null> {
  console.log(
    "Serviço de Moedas: Cache vazio ou expirado. Utilizando API externa...."
  );

  try {
    const response = await axios.get(API_URL);

    const quotes = response.data;

    return quotes;
  } catch (error) {
    console.error("Erro ao buscar cotações de moedas: ", error);
    return null;
  }
}
