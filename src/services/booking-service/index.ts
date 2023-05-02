import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import hotelRepository from '@/repositories/hotels-repository';
import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import { forbiddenBookingError, notFoundBookingError } from '@/errors/booking-error';

async function createBooking(roomId: number, userId: number): Promise<{ bookingId: number }> {
  const room = await hotelRepository.findRoomById(roomId);

  if (!room) {
    throw notFoundBookingError('Room not found!');
  }

  const booking = await bookingRepository.findBookingByRoomId(roomId);

  if (booking) {
    throw forbiddenBookingError('Booking already exists!');
  }

  const enrollment = await enrollmentRepository.findByUserId(userId);

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  const ticketType = await ticketsRepository.findTicketTypeById(ticket.ticketTypeId);

  if (ticket.status !== 'PAID' || ticketType.isRemote || !ticketType.includesHotel) {
    throw forbiddenBookingError('Verify if ticket is paid, presencial and includes hotel!');
  }

  const bookingId = await bookingRepository.createBooking(roomId, userId);

  return { bookingId };
}

const bookingService = { createBooking };

export default bookingService;
