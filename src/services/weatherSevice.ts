import axios from "axios";
import { WeatherData } from "../types/weather";

const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY_ID = "3465944";
const API_URL = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${API_KEY}`;

const kelvinToCelsius = (kelvin: number): number => {
  return parseFloat((kelvin - 273.15).toFixed(1));
};

export async function fetchWeatherFromAPI(): Promise<WeatherData | null> {
  console.log(
    "Serviço de Tempo: Buscando previsão da API externa (OpenWeatherMap)..."
  );
  try {
    const response = await axios.get(API_URL);
    const apiData = response.data;

    const weatherData: WeatherData = {
      location: apiData.name,
      temperature: kelvinToCelsius(apiData.main.temp),
      feelsLike: kelvinToCelsius(apiData.main.feels_like),
      condition: apiData.weather[0]?.description || "Sem descrição",
      humidity: apiData.main.humidity,
      iconUrl: `https://openweathermap.org/img/wn/${apiData.weather[0].icon}@2x.png`,
      recordedAt: new Date(apiData.dt * 1000),
    };

    return weatherData;
  } catch (error) {
    console.error("Erro ao buscar previsão do tempo da API:", error);
    return null;
  }
}
