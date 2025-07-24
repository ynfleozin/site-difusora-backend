export interface CoffeePrice {
  description: string;
  value: number | null;
}

export interface DailyCoffeeQuote {
  day: number;
  arabica: CoffeePrice[];
  conilon: CoffeePrice[];
}

export interface MonthlyCoffeeReport {
  id?: string;
  year: number;
  month: number;
  harvest: string;
  quotes: DailyCoffeeQuote[];
  monthlyAverage: {
    arabica: CoffeePrice[];
    conilon: CoffeePrice[];
  };
  scrapedAt: Date;
}
