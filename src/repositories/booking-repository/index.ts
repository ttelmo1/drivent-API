import { prisma } from '@/config';

async function findBookingByRoomId(roomId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      roomId: roomId,
    },
  });
  return booking.id;
}

async function createBooking(roomId: number, userId: number) {
  const booking = await prisma.booking.create({
    data: {
      roomId: roomId,
      userId: userId,
    },
  });
  return booking.id;
}

export default {
  findBookingByRoomId,
  createBooking,
};
