import {Router} from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getWeather } from '../../services/weatherSevice';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try{
        const quotes = await getWeather();
        if(quotes){
            res.json(quotes);
        }else {
            res.status(500).json({message: 'Não foi possível obter informações sobre o clima no momento'});
        }
    }catch(error){
        next(error);
    }
});

export default router;