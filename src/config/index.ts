import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  sites: {
    camara: {
      url: "https://www.camara.leg.br/noticias/ultimas",
    },
  },
  cache: {
    // Tempo de vida do cache = 1 hora
    ttl: 3600,
  },
};
