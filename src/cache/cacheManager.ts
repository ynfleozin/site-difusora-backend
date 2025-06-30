import fs from "fs/promises";
import { config } from "../config/index";
import type { NewsArticle } from "../types/news";
import path from 'path';

interface CacheContent<T> {
  timestamp: number;
  data: T;
}

export async function setCache(key: string, data: any, ttl: number): Promise<void> {
  const cacheFilePath = path.resolve(`./${key}-cache.json`);
  const cacheData: CacheContent<any> = {
    timestamp: Date.now(),
    data: data,
  };

  try {
    await fs.writeFile(cacheFilePath, JSON.stringify(cacheData, null, 2));
    console.log(`[Cache] Cache para a chave '${key}' atualizado com sucesso.`);
  } catch (error) {
    console.error(`[Cache] ERRO CRÍTICO: Não foi possível escrever o arquivo de cache para a chave '${key}'`);
    console.error('Erro original:', error);
  }
};

export async function getCache(key: string, ttl: number): Promise<any | null> {
  const cacheFilePath = path.resolve(`./${key}-cache.json`);
  try {
    const fileContent = await fs.readFile(cacheFilePath, "utf-8");
    const cacheData: CacheContent<any> = JSON.parse(fileContent);

    //Verifica a validade do cache
    const isCacheValid =
      (Date.now() - cacheData.timestamp) / 1000 < config.cache.ttl;

    if (isCacheValid) {
      console.log(`[Cache] Servindo dados do cache para a chave '${key}'. Válido!`);
      return cacheData.data;
    }
    
    console.log(`[Cache] Cache para a chave '${key}' encontrado, mas expirado.`);
    return null;
  } catch (error) {
    console.log(`[Cache] Nenhum cache encontrado para a chave '${key}'.`);
    return null;
  }
}
