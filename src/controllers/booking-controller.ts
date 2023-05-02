import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import hotelRepository from '@/repositories/hotels-repository';

export async function findBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { userId } = req;
  try {
    const booking = await bookingService.findBooking(userId);
    const room = await hotelRepository.findRoomById(booking.roomId);

    return res.status(httpStatus.OK).send({
      id: booking.id,
      Room: { ...room },
    });
  } catch (e) {
    next(e);
  }
}

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
