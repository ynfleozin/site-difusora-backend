export interface WeatherData {
  id?: string;
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  iconUrl: string;
  recordedAt: Date;
}
