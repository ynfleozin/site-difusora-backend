import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import {
  getAggregatedNews,
  getArticleBySlug,
  getNewsByCategory,
  getAvailableCategories,
  addLocalNewsArticle,
  getLocalNews,
} from "../../services/newsService";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// GETS

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Recebida requisição na rota /api/news. Chamando o serviço...");
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    const news = await getAggregatedNews();
    res.json(news);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/local",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Recebida requisição na rota /api/news/local.");
      const news = await getLocalNews();
      res.json(news);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/category/:categoryName",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryName } = req.params;

      const news = await getNewsByCategory(categoryName);

      res.json(news);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/categories",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await getAvailableCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const article = await getArticleBySlug(slug);

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: "Notícia não encontrada" });
    }
  } catch (error) {
    next(error);
  }
});

// POST

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const localNewsData = req.body;
    const addedNews = await addLocalNewsArticle(localNewsData);
    res.status(201).json(addedNews);
  } catch (error) {
    next(error);
  }
});

export default router;
