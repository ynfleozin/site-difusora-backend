import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getLatestCoffeeQuoteService } from "../../services/coffeeService";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quoteData = await getLatestCoffeeQuoteService();

    if (quoteData) {
      res.json(quoteData);
    } else {
      res.status(404).json({
        message: `Nenhuma cotação de café foi encontrada.`,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
