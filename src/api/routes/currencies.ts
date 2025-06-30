import {Router} from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getCurrencyQuotes } from '../../services/currencyService';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try{
        const quotes = await getCurrencyQuotes();
        if(quotes){
            res.json(quotes);
        }else {
            res.status(500).json({message: 'Não foi possível obter as cotações no momento'});
        }
    }catch(error){
        next(error);
    }
});

export default router;