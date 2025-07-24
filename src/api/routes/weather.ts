import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getLatestWeatherReading } from '../../database/firestoreService';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const weatherData = await getLatestWeatherReading();
        
        if (weatherData) {
            res.json(weatherData);
        } else {
            res.status(404).json({ message: 'Nenhuma informação sobre o clima encontrada.' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;