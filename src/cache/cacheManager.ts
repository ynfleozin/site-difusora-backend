import fs from "fs/promises";
import path from "path";
import { config } from "../config/index";
import type { NewsArticle } from "../types/news";

const cacheFilePath = path.resolve("./news-cache.json");

interface CacheContent {
  timestamp: number;
  news: NewsArticle[];
}

export async function setCache(data: NewsArticle[]): Promise<void> {
  const cacheData: CacheContent = {
    timestamp: Date.now(),
    news: data,
  };
  await fs.writeFile(cacheFilePath, JSON.stringify(cacheData, null, 2));
  console.log("Cache atualizado com sucesso.");
}

export async function getCache(): Promise<NewsArticle[] | null> {
  try {
    const fileContent = await fs.readFile(cacheFilePath, "utf-8");
    const cacheData: CacheContent = JSON.parse(fileContent);

    //Verifica a validade do cache
    const isCacheValid =
      (Date.now() - cacheData.timestamp) / 1000 < config.cache.ttl;

    if (isCacheValid) {
      console.log("Servindo notícias do cache. Válido!");
      return cacheData.news;
    }

    console.log("Cache encontrado, mas expirado.");
    return null;
  } catch (error) {
    console.log("Nenhum cache encontrado.");
    return null;
  }
}
