import { Hotel } from '@prisma/client';
import { prisma } from '@/config';

async function getAll(): Promise<Hotel[]> {
  return await prisma.hotel.findMany();
}

async function getHotelRoomsById(hotelId: number) {
  return await prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}

const hotelsRepository = {
  getAll,
  getHotelRoomsById,
  findRoomById,
};

export default hotelsRepository;
