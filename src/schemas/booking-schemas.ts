import Joi from 'joi';
import { Booking } from '@prisma/client';

export const bookingSchema = Joi.object<Booking>({
  roomId: Number,
});

export const bookingSchemaUpdate = Joi.object<Booking>({
  roomId: Number,
});
