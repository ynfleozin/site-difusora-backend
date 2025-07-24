import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getMonthlyCoffeeReport } from "../../services/coffeeService";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : now.getFullYear();
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : now.getMonth() + 1;

    if (isNaN(year) || isNaN(month)) {
      return res
        .status(400)
        .json({ message: "Parâmetros de ano e/ou mês inválidos." });
    }

    const report = await getMonthlyCoffeeReport(year, month);

    if (report) {
      res.json(report);
    } else {
      res.status(404).json({
        message: `Não foram encontradas cotações para ${year}-${month}.`,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
