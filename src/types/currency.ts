export interface CurrencyQuote {
  code: string;      
  codein: string;     
  name: string;       
  high: string;       // valor máximo do dia
  low: string;        // valor mínimo do dia
  varBid: string;     // variação
  pctChange: string;  // variação em porcentagem
  bid: string;        // valor de compra
  ask: string;        // valor de venda
  timestamp: string; 
  create_date: string;
}

export interface CurrencyQuotes {
  [key: string]: CurrencyQuote;
}