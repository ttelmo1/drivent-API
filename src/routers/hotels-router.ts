import { Router } from 'express';
import { getAllHotels, getRooms } from '@/controllers/hotels-controller';
import { authenticateToken } from '@/middlewares';

export const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', getAllHotels).get('/:hotelId', getRooms);
