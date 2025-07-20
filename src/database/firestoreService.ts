import { db } from "../config/firebase";
import * as admin from "firebase-admin";
import { NewsArticle } from "../types/news";

const LOCAL_NEWS_COLLECTION = "local-news";
const SCRAPED_NEWS_COLLECTION = "scraped-news";

export async function saveLocalNews(
  article: NewsArticle
): Promise<NewsArticle> {
  const docRef = article.id
    ? db.collection(LOCAL_NEWS_COLLECTION).doc(article.id)
    : db.collection(LOCAL_NEWS_COLLECTION).doc();

  const articleToSave = {
    ...article,
    publishedAt: admin.firestore.Timestamp.fromDate(article.publishedAt),
    imageUrl: article.imageUrl || null,
    author: article.author || null,
    description: article.description || null,
  };

  await docRef.set(articleToSave, { merge: true });

  return { ...article, id: docRef.id };
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
        id: doc.id,
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
    console.log(`Encontradas ${news.length} notícias locais no Firestore.`);
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

  return { ...article, id: docRef.id };
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
        id: doc.id,
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
    console.log(`Encontradas ${news.length} notícias raspadas no Firestore.`);
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
        id: doc.id,
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
        id: doc.id,
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
