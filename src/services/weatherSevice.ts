import axios from "axios";
import { getCache, setCache } from "../cache/cacheManager";

const CACHE_KEY = "weather_colatina";
const CACHE_TTL = 900; // Cache de 15 minutos (900s)

// **IMPORTANTE**: Substitua 'SUA_CHAVE_DE_API' pela chave que você pegou no site WeatherAPI
const API_KEY = process.env.WEATHER_API_KEY || "SUA_CHAVE_DE_API";
const API_URL = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Colatina&aqi=no`;

export async function getWeather() {
  const cachedWeather = await getCache(CACHE_KEY, CACHE_TTL);
  if (cachedWeather) {
    return cachedWeather;
  }

  console.log("Serviço de Tempo: Buscando previsão da API externa...");
  try {
    const response = await axios.get(API_URL);
    const weatherData = {
      location: `${response.data.location.name}, ${response.data.location.region}`,
      temperature: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      humidity: response.data.current.humidity,
      icon: `https:${response.data.current.condition.icon}`, // Pegamos o ícone também!
    };

    await setCache(CACHE_KEY, weatherData, CACHE_TTL);
    return weatherData;
  } catch (error) {
    console.error("Erro ao buscar previsão do tempo:", error);
    return null;
  }
}
