import { db } from "../config/firebase";
import * as admin from "firebase-admin";
import { NewsArticle } from "../types/news";
import { CurrencyQuotes } from "../types/currency";
import { WeatherData } from "../types/weather";
import { LatestCoffeeData } from "../types/coffee";
import { SimpleCache } from "../cache/cache";

export interface Banner {
  id?: string;
  name: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  isVisible?: boolean;
}

const LOCAL_NEWS_COLLECTION = "local-news";
const SCRAPED_NEWS_COLLECTION = "scraped-news";
const BANNERS_COLLECTION = "banners";
const CURRENCIES_COLLECTION = "currencies";
const WEATHER_COLLECTION = "weather";
const COFFEE_COLLECTION = "coffee";
const LIVE_STREAM_COLLECTION = "live-stream";
const LIVE_STREAM_DOC_ID = "current-live";

export const scrapedNewsCache = new SimpleCache<NewsArticle[]>(3600);
export const localNewsCache = new SimpleCache<NewsArticle[]>(3600);
export const categoryNewsCache = new SimpleCache<Record<string, NewsArticle[]>>(
  3600
);

export async function saveLocalNews(
  article: NewsArticle
): Promise<NewsArticle> {
  const existingDocQuery = await db
    .collection(LOCAL_NEWS_COLLECTION)
    .where("slug", "==", article.slug)
    .where("sourceName", "==", article.sourceName)
    .limit(1)
    .get();

  let docRef;
  if (!existingDocQuery.empty) {
    const existingDoc = existingDocQuery.docs[0];
    docRef = existingDoc.ref;

    const existingData = existingDoc.data();

    const isEqual = (a: NewsArticle, b: any) =>
      a.title === b.title &&
      a.body === b.body &&
      a.description === b.description &&
      a.publishedAt.getTime() === b.publishedAt.toDate().getTime() &&
      a.imageUrl === b.imageUrl &&
      a.author === b.author &&
      a.category === b.category;

    if (isEqual(article, existingData)) {
      return article;
    }
  } else {
    docRef = db.collection(LOCAL_NEWS_COLLECTION).doc();
  }

  const articleToSave = {
    ...article,
    publishedAt: admin.firestore.Timestamp.fromDate(article.publishedAt),
    imageUrl: article.imageUrl || null,
    author: article.author || null,
    description: article.description || null,
    category: article.category?.toLowerCase() || null,
  };

  await docRef.set(articleToSave, { merge: true });

  return article;
}

export async function getAllLocalNews(): Promise<NewsArticle[]> {
  try {
    const snapshot = await db.collection(LOCAL_NEWS_COLLECTION).get();
    const news: NewsArticle[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const publishedAt = (
        data.publishedAt as admin.firestore.Timestamp
      ).toDate();
      news.push({
        title: data.title,
        description: data.description,
        body: data.body,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,
        publishedAt: publishedAt,
        imageUrl: data.imageUrl,
        author: data.author,
        category: data.category,
        slug: data.slug,
      });
    });
    return news;
  } catch (error) {
    console.error("Erro ao buscar notícias locais do Firestore:", error);
    return [];
  }
}

export async function saveScrapedNews(
  article: NewsArticle
): Promise<NewsArticle> {
  const existingDocQuery = await db
    .collection(SCRAPED_NEWS_COLLECTION)
    .where("slug", "==", article.slug)
    .where("sourceName", "==", article.sourceName)
    .limit(1)
    .get();

  let docRef;
  if (!existingDocQuery.empty) {
    const existingDoc = existingDocQuery.docs[0];
    docRef = existingDoc.ref;

    const existingData = existingDoc.data();

    const isEqual = (a: NewsArticle, b: any) =>
      a.title === b.title &&
      a.body === b.body &&
      a.description === b.description &&
      a.publishedAt.getTime() === b.publishedAt.toDate().getTime() &&
      a.imageUrl === b.imageUrl &&
      a.author === b.author &&
      a.category === b.category;

    if (isEqual(article, existingData)) {
      return article;
    }
  } else {
    docRef = db.collection(SCRAPED_NEWS_COLLECTION).doc();
  }

  const articleToSave = {
    ...article,
    publishedAt: admin.firestore.Timestamp.fromDate(article.publishedAt),
    imageUrl: article.imageUrl || null,
    author: article.author || null,
    description: article.description || null,
    category: article.category?.toLowerCase() || null,
  };

  await docRef.set(articleToSave, { merge: true });

  return article;
}

export async function getAllScrapedNews(): Promise<NewsArticle[]> {
  try {
    const snapshot = await db.collection(SCRAPED_NEWS_COLLECTION).get();
    const news: NewsArticle[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const publishedAt = (
        data.publishedAt as admin.firestore.Timestamp
      ).toDate();
      news.push({
        title: data.title,
        body: data.body,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,
        publishedAt: publishedAt,
        imageUrl: data.imageUrl,
        author: data.author,
        category: data.category,
        slug: data.slug,
      });
    });
    return news;
  } catch (error) {
    console.error("Erro ao buscar notícias raspadas do Firestore:", error);
    return [];
  }
}

export async function getNewsBySlugFromFirestore(
  slug: string
): Promise<NewsArticle | undefined> {
  try {
    const localSnapshot = await db
      .collection(LOCAL_NEWS_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!localSnapshot.empty) {
      const doc = localSnapshot.docs[0];
      const data = doc.data();
      const publishedAt = (
        data.publishedAt as admin.firestore.Timestamp
      ).toDate();
      console.log(`Notícia local com slug "${slug}" encontrada.`);
      return {
        title: data.title,
        body: data.body,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,
        publishedAt: publishedAt,
        imageUrl: data.imageUrl,
        author: data.author,
        category: data.category,
        slug: data.slug,
      };
    }

    const scrapedSnapshot = await db
      .collection(SCRAPED_NEWS_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!scrapedSnapshot.empty) {
      const doc = scrapedSnapshot.docs[0];
      const data = doc.data();
      const publishedAt = (
        data.publishedAt as admin.firestore.Timestamp
      ).toDate();
      console.log(`Notícia raspada com slug "${slug}" encontrada.`);
      return {
        title: data.title,
        body: data.body,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,
        publishedAt: publishedAt,
        imageUrl: data.imageUrl,
        author: data.author,
        category: data.category,
        slug: data.slug,
      };
    }

    console.log(
      `Notícia com slug "${slug}" não encontrada em nenhuma coleção do Firestore.`
    );
    return undefined;
  } catch (error) {
    console.error(
      `Erro ao buscar notícia por slug "${slug}" no Firestore:`,
      error
    );
    return undefined;
  }
}

export async function getCachedScrapedNews(): Promise<NewsArticle[]> {
  const cached = scrapedNewsCache.get();
  if (cached) {
    console.log("Retornando notícias raspadas do cache");
    return cached;
  }

  console.log("Buscando notícias raspadas do Firestore");
  const snapshot = await db
    .collection(SCRAPED_NEWS_COLLECTION)
    .orderBy("publishedAt", "desc")
    .limit(10)
    .get();

  const news = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      title: data.title,
      body: data.body,
      sourceUrl: data.sourceUrl,
      sourceName: data.sourceName,
      publishedAt: (data.publishedAt as admin.firestore.Timestamp).toDate(),
      imageUrl: data.imageUrl,
      author: data.author,
      category: data.category,
      slug: data.slug,
    };
  });

  scrapedNewsCache.set(news);
  return news;
}

export async function getCachedNewsByCategory(
  category: string
): Promise<NewsArticle[]> {
  const cached = categoryNewsCache.get();
  const cleanCategory = category.toLowerCase().trim();

  if (cached && cached[cleanCategory]) {
    console.log(`Retornando notícias da categoria "${cleanCategory}" do cache`);
    return cached[cleanCategory];
  }

  console.log(`Buscando notícias da categoria "${cleanCategory}" no Firestore`);

  const [scrapedSnapshot, localSnapshot] = await Promise.all([
    db
      .collection(SCRAPED_NEWS_COLLECTION)
      .where("category", "==", cleanCategory)
      .get(),
    db
      .collection(LOCAL_NEWS_COLLECTION)
      .where("category", "==", cleanCategory)
      .get(),
  ]);

  const mapDocToNewsArticle = (
    doc: admin.firestore.DocumentSnapshot
  ): NewsArticle => {
    const data = doc.data()!;
    return {
      title: data.title,
      body: data.body,
      sourceUrl: data.sourceUrl,
      sourceName: data.sourceName,
      publishedAt: (data.publishedAt as admin.firestore.Timestamp).toDate(),
      imageUrl: data.imageUrl,
      author: data.author,
      category: data.category,
      slug: data.slug,
    };
  };

  const scrapedNews = scrapedSnapshot.docs.map(mapDocToNewsArticle);
  const localNews = localSnapshot.docs.map(mapDocToNewsArticle);

  const allNews = [...scrapedNews, ...localNews];
  allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  categoryNewsCache.set({
    ...(cached || {}),
    [cleanCategory]: allNews,
  });

  console.log(
    `Encontradas ${allNews.length} notícias para a categoria "${cleanCategory}".`
  );
  return allNews;
}

let localNewsFetchPromise: Promise<NewsArticle[]> | null = null;

export async function getCachedLocalNews(): Promise<NewsArticle[]> {
  const cached = localNewsCache.get();
  if (cached) {
    console.log("Retornando notícias locais do cache");
    return cached;
  }

  if (!localNewsFetchPromise) {
    console.log("🔄 Buscando notícias locais do Firestore...");
    localNewsFetchPromise = (async () => {
      const snapshot = await db.collection(LOCAL_NEWS_COLLECTION).get();

      const news: NewsArticle[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        news.push({
          title: data.title,
          description: data.description,
          body: data.body,
          sourceUrl: data.sourceUrl,
          sourceName: data.sourceName,
          publishedAt: (data.publishedAt as admin.firestore.Timestamp).toDate(),
          imageUrl: data.imageUrl,
          author: data.author,
          category: data.category,
          slug: data.slug,
        });
      });

      localNewsCache.set(news);
      return news;
    })();
  } else {
    console.log(
      "⏳ Outra requisição já está carregando notícias locais, aguardando..."
    );
  }

  try {
    return await localNewsFetchPromise;
  } finally {
    localNewsFetchPromise = null;
  }
}

// Banners

export async function getAllBanners(): Promise<Banner[]> {
  try {
    const snapshot = await db.collection(BANNERS_COLLECTION).get();
    const banners: Banner[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      banners.push({
        id: doc.id,
        name: data.name,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || "#",
        altText: data.altText || "Anúncio",
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
      });
    });
    return banners;
  } catch (error) {
    console.error("Erro ao buscar banners do Firestore:", error);
    return [];
  }
}

export async function updateBannerVisibility(
  id: string,
  isVisible: boolean
): Promise<boolean> {
  try {
    const bannerRef = db.collection(BANNERS_COLLECTION).doc(id);
    await bannerRef.update({ isVisible: isVisible });
    console.log(`Visibilidade do banner ${id} atualizada para ${isVisible}`);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar visibilidade do banner ${id}:`, error);
    return false;
  }
}

export async function updateBannerImage(
  id: string,
  newImageUrl: string
): Promise<boolean> {
  try {
    const bannerRef = db.collection(BANNERS_COLLECTION).doc(id);
    await bannerRef.update({ imageUrl: newImageUrl });
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar o banner ${id} no Firestore:`, error);
    return false;
  }
}

export async function saveBanner(banner: Banner): Promise<Banner> {
  const docRef = banner.id
    ? db.collection(BANNERS_COLLECTION).doc(banner.id)
    : db.collection(BANNERS_COLLECTION).doc();

  await docRef.set(banner, { merge: true });

  return { ...banner, id: docRef.id };
}

// Cotações

export async function saveCurrencyQuotes(
  quotes: CurrencyQuotes
): Promise<void> {
  try {
    const docRef = db.collection(CURRENCIES_COLLECTION).doc("latest");
    await docRef.set({
      ...quotes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Cotações de moedas salvas com sucesso no Firestore.");
  } catch (error) {
    console.error("Erro ao salvar cotações no Firestore:", error);
  }
}

export async function getLatestCurrencyQuotes(): Promise<CurrencyQuotes | null> {
  try {
    const docRef = db.collection(CURRENCIES_COLLECTION).doc("latest");
    const doc = await docRef.get();

    if (!doc.exists) {
      console.warn(
        "Nenhum documento de cotações ('latest') encontrado no Firestore."
      );
      return null;
    }

    const { updatedAt, ...quotes } = doc.data() as CurrencyQuotes & {
      updatedAt: admin.firestore.Timestamp;
    };
    return quotes;
  } catch (error) {
    console.error("Erro ao buscar cotações do Firestore:", error);
    return null;
  }
}

// Clima

export async function saveWeatherReading(reading: WeatherData): Promise<void> {
  try {
    // ✅ Usa um ID de documento fixo para sobrescrever sempre o mais recente
    const docRef = db.collection(WEATHER_COLLECTION).doc("latest");

    const readingToSave = {
      ...reading,
      recordedAt: admin.firestore.Timestamp.fromDate(reading.recordedAt),
    };

    await docRef.set(readingToSave);
    console.log(
      "Dados do clima mais recentes foram salvos/atualizados com sucesso."
    );
  } catch (error) {
    console.error("Erro ao salvar dados do clima no Firestore:", error);
  }
}

export async function getLatestWeatherReading(): Promise<WeatherData | null> {
  try {
    const docRef = db.collection(WEATHER_COLLECTION).doc("latest");
    const doc = await docRef.get();

    if (!doc.exists) {
      console.warn(
        "Nenhum registro de clima ('latest') encontrado no Firestore."
      );
      return null;
    }

    const data = doc.data() as any;
    const recordedAt = (data.recordedAt as admin.firestore.Timestamp).toDate();

    return {
      id: doc.id,
      location: data.location,
      temperature: data.temperature,
      feelsLike: data.feelsLike,
      condition: data.condition,
      humidity: data.humidity,
      iconUrl: data.iconUrl,
      recordedAt: recordedAt,
    };
  } catch (error) {
    console.error("Erro ao buscar dados do clima do Firestore:", error);
    return null;
  }
}

// Café

export async function saveLatestCoffeeQuote(
  data: LatestCoffeeData
): Promise<void> {
  try {
    const docRef = db.collection(COFFEE_COLLECTION).doc("latest");

    const dataToSave = {
      ...data,
      scrapedAt: admin.firestore.Timestamp.fromDate(data.scrapedAt),
    };

    await docRef.set(dataToSave);
    console.log(
      `Cotação de café mais recente (Dia ${data.quote.day}) salva com sucesso.`
    );
  } catch (error) {
    console.error(
      "Erro ao salvar a cotação de café mais recente no Firestore:",
      error
    );
  }
}

export async function getLatestCoffeeQuote(): Promise<LatestCoffeeData | null> {
  try {
    const docRef = db.collection(COFFEE_COLLECTION).doc("latest");
    const doc = await docRef.get();

    if (!doc.exists) {
      console.warn(`Nenhum documento 'latest' de cotação de café encontrado.`);
      return null;
    }

    const data = doc.data() as any;
    const scrapedAt = (data.scrapedAt as admin.firestore.Timestamp).toDate();

    return { ...data, id: doc.id, scrapedAt };
  } catch (error) {
    console.error(`Erro ao buscar a cotação de café mais recente:`, error);
    return null;
  }
}

// Live

function convertToYouTubeEmbed(url: string): string | null {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

  const match = url.match(regex);
  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
}

export async function getLiveStreamLink(): Promise<string | null> {
  try {
    const doc = await db
      .collection(LIVE_STREAM_COLLECTION)
      .doc(LIVE_STREAM_DOC_ID)
      .get();
    if (doc.exists) {
      const data = doc.data();
      return data?.liveLinkEmbed || null;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar link da live:", error);
    return null;
  }
}

export async function setLiveStreamLink(originalLink: string): Promise<void> {
  try {
    const embedLink = convertToYouTubeEmbed(originalLink);
    if (!embedLink) {
      throw new Error("Link do YouTube inválido ou formato não suportado.");
    }

    await db.collection(LIVE_STREAM_COLLECTION).doc(LIVE_STREAM_DOC_ID).set({
      liveLinkOriginal: originalLink,
      liveLinkEmbed: embedLink,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao salvar link da live:", error);
    throw error;
  }
}

export async function removeLiveStreamLink(): Promise<void> {
  try {
    await db
      .collection(LIVE_STREAM_COLLECTION)
      .doc(LIVE_STREAM_DOC_ID)
      .delete();
  } catch (error) {
    console.error("Erro ao remover link da live:", error);
    throw error;
  }
}
