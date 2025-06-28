import express from 'express';
import type { ErrorRequestHandler } from 'express';
import {config} from './config/index';

import newsRoutes from './api/routes/news';

const app = express();

app.use('/api/news', newsRoutes);

// Manipulador de erros
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({message: 'Ocorreu um erro no servidor!'});
};
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Servidor TypeScript rodando na porta ${config.port}`);
  console.log(`Teste a API em: http://localhost:${config.port}/api/news`);
});