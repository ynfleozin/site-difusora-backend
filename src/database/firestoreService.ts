import { db } from "../config/firebase";
import * as admin from "firebase-admin";
import { NewsArticle } from "../types/news";

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
