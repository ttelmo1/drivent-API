import faker from '@faker-js/faker';
import { TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType(params: Partial<TicketType> = {}) {
  const isRemote: boolean = params.isRemote !== undefined ? params.isRemote : faker.datatype.boolean();
  const includesHotel: boolean = params.includesHotel !== undefined ? params.includesHotel : faker.datatype.boolean();
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote,
      includesHotel,
    },
  });
}
export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}
