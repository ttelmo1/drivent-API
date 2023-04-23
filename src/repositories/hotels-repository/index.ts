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

const hotelsRepository = {
  getAll,
  getHotelRoomsById,
};

export default hotelsRepository;
