import { Hotel } from '@prisma/client';
import httpStatus from 'http-status';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError, requestError } from '@/errors';
import { paymentRequiredError } from '@/errors/payment-required-error';

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  const {
    TicketType: { isRemote, includesHotel },
  } = ticket;
  if (ticket.status !== 'PAID' || isRemote || !includesHotel) throw paymentRequiredError();
  const hotels = await hotelsRepository.getAll();
  if (!hotels || hotels.length === 0) throw notFoundError();
  return hotels;
}

async function getRooms({ userId, hotelId }: { userId: number; hotelId: number }) {
  if (isNaN(hotelId)) throw requestError(httpStatus.BAD_REQUEST, 'Invalid Hotel Id');
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  const {
    TicketType: { isRemote, includesHotel },
  } = ticket;
  if (ticket.status !== 'PAID' || isRemote || !includesHotel) throw paymentRequiredError();

  const hotel = await hotelsRepository.getHotelRoomsById(hotelId);
  if (!hotel) throw notFoundError();
  return hotel;
}

const hotelService = {
  getHotels,
  getRooms,
};

export default hotelService;
