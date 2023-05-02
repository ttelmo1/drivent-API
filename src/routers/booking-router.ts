import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBooking, findBooking, updateBooking } from '@/controllers';
import { bookingSchema, bookingSchemaUpdate } from '@/schemas/booking-schemas';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', findBooking)
  .post('/', validateBody(bookingSchema), createBooking)
  .put('/:bookingId', validateBody(bookingSchemaUpdate), updateBooking);

export { bookingsRouter };
