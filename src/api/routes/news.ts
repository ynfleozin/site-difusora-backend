import {Router} from 'express';
import type { Request, Response, NextFunction } from 'express';

import { getAggregatedNews } from '../../services/newsService';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try{
        console.log('Recebida requisição na rota /api/news. Chamando o serviço...');

        const news = await getAggregatedNews();
        res.json(news);
    }catch(error){
        next(error);
    }
});

export default router;