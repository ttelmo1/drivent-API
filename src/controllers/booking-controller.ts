import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  try {
    const { bookingId } = await bookingService.createBooking(roomId, userId);
    return res.status(httpStatus.OK).send({ bookingId });
  } catch (e) {
    next(e);
  }
}
