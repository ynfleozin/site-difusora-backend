import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import cron from "node-cron";

import { config } from "./config/index";

import { runScrapingJob } from "./jobs/newsScraperJob";
import { runCurrencyUpdateJob } from "./jobs/currencyUpdaterJob";
import { runWeatherUpdateJob } from "./jobs/weatherUpdaterJob";
import { runCoffeeQuotesUpdateJob } from "./jobs/coffeeUpdaterJob";
import newsRoutes from "./api/routes/news";
import currencyRoutes from "./api/routes/currencies";
import weatherRoutes from "./api/routes/weather";
import authRoutes from "./api/routes/auth";
import bannerRoutes from "./api/routes/banner";
import coffeRoutes from "./api/routes/coffee";
import liveStreamRoutes from "./api/routes/liveStream";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/coffee", coffeRoutes);
app.use("api/live-stream", liveStreamRoutes);

// Manipulador de erros
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Ocorreu um erro no servidor!" });
};
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Servidor TypeScript rodando na porta ${config.port}`);
});

// Jobs
cron.schedule("0 * * * *", () => {
  console.log(
    "⏰ Agendamento do cron: Executando o job de scraping de notícias..."
  );
  runScrapingJob();
});

cron.schedule("*/15 * * * *", () => {
  console.log(
    "⏰ Agendamento do cron: Executando o job de atualização de cotações..."
  );
  runCurrencyUpdateJob();
});

cron.schedule("*/15 * * * *", () => {
  console.log(
    "⏰ Agendamento do cron: Executando o job de atualização do clima..."
  );
  runWeatherUpdateJob();
});

cron.schedule("0 1 * * *", () => {
  console.log("⏰ Agendamento do cron: Executando o job de cotação de café...");
  runCoffeeQuotesUpdateJob();
});

app.listen(config.port, () => {
  console.log(`Servidor TypeScript rodando na porta ${config.port}`);

  console.log("🚀 Servidor iniciado. Executando jobs pela primeira vez...");
  runScrapingJob();
  runCurrencyUpdateJob();
  runWeatherUpdateJob();
  runCoffeeQuotesUpdateJob();
});
