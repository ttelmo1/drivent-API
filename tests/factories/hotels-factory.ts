import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business(),
    },
    include: {
      Rooms: true,
    },
  });
}

export async function createRoom(hotelId: number) {
  return await prisma.room.create({
    data: {
      name: faker.company.companyName(),
      capacity: faker.datatype.number({ min: 1, max: 4 }),
      hotelId,
    },
  });
}
