import axios from "axios";

const CACHE_KEY = "weather_colatina";
const CACHE_TTL = 900; // Cache de 15 minutos (900s)

const API_KEY = process.env.WEATHER_API_KEY;
const API_URL = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Colatina&aqi=no`;

export async function getWeather() {
  console.log("Serviço de Tempo: Buscando previsão da API externa...");
  try {
    const response = await axios.get(API_URL);
    const weatherData = {
      location: `${response.data.location.name}, ${response.data.location.region}`,
      temperature: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      humidity: response.data.current.humidity,
      icon: `https:${response.data.current.condition.icon}`,
    };

    return weatherData;
  } catch (error) {
    console.error("Erro ao buscar previsão do tempo:", error);
    return null;
  }
}
