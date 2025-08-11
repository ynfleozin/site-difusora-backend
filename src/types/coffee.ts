export interface CoffeePrice {
  description: string;
  value: number | null;
}

export interface DailyCoffeeQuote {
  day: number;
  arabica: CoffeePrice[];
  conilon: CoffeePrice[];
}

export interface LatestCoffeeData {
  id?: string;
  harvest: string;
  quote: DailyCoffeeQuote;
  scrapedAt: Date;
}
