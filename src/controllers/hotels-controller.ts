import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotels-service';

export async function getAllHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  try {
    const hotels = await hotelService.getHotels(userId);
    return res.send(hotels);
  } catch (error) {
    next(error);
  }
}

export async function getRooms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId, params } = req;
  const hotelId = Number(params.hotelId) as number;
  try {
    const hotel = await hotelService.getRooms({ userId, hotelId });
    res.send(hotel);
  } catch (error) {
    if (error.name === 'RequestError') return res.status(error.status).send(error.message);
    next(error);
  }
}
