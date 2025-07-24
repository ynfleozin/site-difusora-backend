import { fetchWeatherFromAPI } from "../services/weatherSevice";
import { saveWeatherReading } from "../database/firestoreService";

export async function runWeatherUpdateJob() {
  console.log("Executando job de atualização do clima...");
  const weatherData = await fetchWeatherFromAPI();

  if (weatherData) {
    await saveWeatherReading(weatherData);
  } else {
    console.error("Job de clima: Falha ao obter dados da API, nada foi salvo.");
  }
}
