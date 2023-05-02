import { Booking } from '@prisma/client';
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

async function findBooking(userId: number): Promise<Booking> {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) {
    throw notFoundError('No booking found for this user!');
  }

  return booking;
}

async function updateBooking(roomId: number, userId: number, bookingId: number) {
  const room = await hotelRepository.findRoomById(roomId);

  if (!room) {
    throw notFoundError('Room not found!');
  }

  const roomIsAlreadyBooked = await bookingRepository.findBookingByRoomId(roomId);

  if (roomIsAlreadyBooked) {
    throw forbiddenBookingError('Room is already booked!');
  }

  const userBooking = await bookingRepository.findBookingByUserId(userId);

  if (!userBooking || userBooking.id !== bookingId) {
    throw forbiddenBookingError('This user does not have a booking!');
  }

  return await bookingRepository.updateBookingById(bookingId, roomId);
}

const bookingService = { createBooking, findBooking, updateBooking };

export default bookingService;
