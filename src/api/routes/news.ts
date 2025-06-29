import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import {
  getAggregatedNews,
  getArticleBySlug,
} from "../../services/newsService";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Recebida requisição na rota /api/news. Chamando o serviço...");

    const news = await getAggregatedNews();
    res.json(news);
  } catch (error) {
    next(error);
  }
});

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

export default router;
