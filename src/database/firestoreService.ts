import { db } from "../config/firebase";
import * as admin from "firebase-admin";
import { NewsArticle } from "../types/news";
import { CurrencyQuotes } from "../types/currency";
import { WeatherData } from "../types/weather";
import { MonthlyCoffeeReport } from "../types/coffee";

export interface Banner {
  id?: string;
  name: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
}

const LOCAL_NEWS_COLLECTION = "local-news";
const SCRAPED_NEWS_COLLECTION = "scraped-news";
const BANNERS_COLLECTION = "banners";
const CURRENCIES_COLLECTION = "currencies";
const WEATHER_COLLECTION = "weather";
const COFFEE_COLLECTION = "coffee";

export async function saveLocalNews(
  article: NewsArticle
): Promise<NewsArticle> {
  const docRef = db.collection(LOCAL_NEWS_COLLECTION).doc();

  const articleToSave = {
    ...article,
    publishedAt: admin.firestore.Timestamp.fromDate(article.publishedAt),
    imageUrl: article.imageUrl || null,
    author: article.author || null,
    description: article.description || null,
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
  const existingDoc = await db
    .collection(SCRAPED_NEWS_COLLECTION)
    .where("slug", "==", article.slug)
    .where("sourceName", "==", article.sourceName)
    .limit(1)
    .get();

  let docRef;
  if (!existingDoc.empty) {
    docRef = existingDoc.docs[0].ref;
  } else {
    docRef = db.collection(SCRAPED_NEWS_COLLECTION).doc();
  }

  const articleToSave = {
    ...article,
    publishedAt: admin.firestore.Timestamp.fromDate(article.publishedAt),
    imageUrl: article.imageUrl || null,
    author: article.author || null,
    description: article.description || null,
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
      });
    });
    return banners;
  } catch (error) {
    console.error("Erro ao buscar banners do Firestore:", error);
    return [];
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
    const docRef = db.collection(WEATHER_COLLECTION).doc(); // Gera um ID automático

    const readingToSave = {
      ...reading,
      recordedAt: admin.firestore.Timestamp.fromDate(reading.recordedAt),
    };

    await docRef.set(readingToSave);
    console.log("Dados do clima salvos com sucesso no Firestore.");
  } catch (error) {
    console.error("Erro ao salvar dados do clima no Firestore:", error);
  }
}

export async function getLatestWeatherReading(): Promise<WeatherData | null> {
  try {
    const snapshot = await db
      .collection(WEATHER_COLLECTION)
      .orderBy("recordedAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn("Nenhum registro de clima encontrado no Firestore.");
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

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

export async function saveCoffeeReport(
  report: MonthlyCoffeeReport
): Promise<void> {
  try {
    const docId = `${report.year}-${String(report.month).padStart(2, "0")}`;
    const docRef = db.collection(COFFEE_COLLECTION).doc(docId);

    const reportToSave = {
      ...report,
      scrapedAt: admin.firestore.Timestamp.fromDate(report.scrapedAt),
    };

    await docRef.set(reportToSave, { merge: true });
    console.log(
      `Relatório de cotações de café para ${docId} salvo com sucesso.`
    );
  } catch (error) {
    console.error(
      "Erro ao salvar o relatório de cotações no Firestore:",
      error
    );
  }
}

export async function getCoffeeReport(
  year: number,
  month: number
): Promise<MonthlyCoffeeReport | null> {
  try {
    const docId = `${year}-${String(month).padStart(2, "0")}`;
    const docRef = db.collection(COFFEE_COLLECTION).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.warn(`Nenhum relatório de cotações encontrado para ${docId}.`);
      return null;
    }

    const data = doc.data() as any;
    const scrapedAt = (data.scrapedAt as admin.firestore.Timestamp).toDate();

    return { ...data, id: doc.id, scrapedAt };
  } catch (error) {
    console.error(
      `Erro ao buscar relatório de cotações de ${year}-${month}:`,
      error
    );
    return null;
  }
}
