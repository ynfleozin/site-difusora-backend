import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import { config } from "./config/index";

import newsRoutes from "./api/routes/news";
import currencyRoutes from "./api/routes/currencies";
import weatherRoutes from "./api/routes/weather";
import { db } from "./config/firebase";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/weather", weatherRoutes);

// Manipulador de erros
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Ocorreu um erro no servidor!" });
};
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Servidor TypeScript rodando na porta ${config.port}`);
  db.collection("test")
    .doc("init")
    .set({ timestamp: new Date() })
    .then(() => {
      console.log("Firestore connection test successful!");
    })
    .catch((err) => {
      console.error("Firestore connection test failed:", err);
    });
});
