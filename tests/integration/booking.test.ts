import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotel,
  createBookingTicketType,
  createRoom,
  createTicket,
  createTicketType,
  createUser,
  createTicketTypeRemote,
  createBookingTicketTypeNoHotel,
} from '../factories';

import { createBooking } from '../factories/booking-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(6),
    });

    it('should respond 404 if user has no booking', async () => {
      const createdUser = await createUser(generateValidBody());

      const token = await generateValidToken(createdUser);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with booking', async () => {
      const createdUser = await createUser(generateValidBody());

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      const booking = await createBooking(createdUser.id, createdRoom.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          ...createdRoom,
          createdAt: createdRoom.createdAt.toISOString(),
          updatedAt: createdRoom.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(6),
    });

    it('should respond 400 if no body is sent', async () => {
      const createdUser = await createUser(generateValidBody());

      const token = await generateValidToken(createdUser);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond 404 if roomId is invalid', async () => {
      const createdUser = await createUser(generateValidBody());

      const token = await generateValidToken(createdUser);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond 403 if roomId is alreadyBooked', async () => {
      const createdUser = await createUser(generateValidBody());

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      await createBooking(createdUser.id, createdRoom.id);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond 403 if ticket is not paid', async () => {
      const createdUser = await createUser(generateValidBody());

      const enrollment = await createEnrollmentWithAddress(createdUser);

      const ticketType = await createTicketType();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond 403 if ticket is remote', async () => {
      const createdUser = await createUser(generateValidBody());

      const enrollment = await createEnrollmentWithAddress(createdUser);

      const ticketType = await createTicketTypeRemote();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond 403 if ticket doesn't include hotel", async () => {
      const createdUser = await createUser(generateValidBody());

      const enrollment = await createEnrollmentWithAddress(createdUser);

      const ticketType = await createBookingTicketTypeNoHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond 200 and bookingId created', async () => {
      const createdUser = await createUser(generateValidBody());

      const enrollment = await createEnrollmentWithAddress(createdUser);

      const ticketType = await createBookingTicketType();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });
  });
});
describe('PUT /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(6),
    });

    it('should respond 404 if roomId is invalid', async () => {
      const createdUser = await createUser(generateValidBody());

      const token = await generateValidToken(createdUser);

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond 403 if roomId is alreadyBooked', async () => {
      const createdUser = await createUser(generateValidBody());

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      await createBooking(createdUser.id, createdRoom.id);

      const response = await server
        .put('/booking/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond 403 if booking is from another user', async () => {
      const createdUser = await createUser(generateValidBody());

      const auxUser = await createUser(generateValidBody());

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      await createBooking(auxUser.id, createdRoom.id);

      const response = await server
        .put('/booking/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond 403 if user does not have bookings', async () => {
      const createdUser = await createUser(generateValidBody());

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      const response = await server
        .put('/booking/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: createdRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond 200 and bookingId updated', async () => {
      const createdUser = await createUser(generateValidBody());

      const createdHotel = await createHotel();

      const createdRoom = await createRoom(createdHotel.id);

      const auxRoom = await createRoom(createdHotel.id);

      const token = await generateValidToken(createdUser);

      const booking = await createBooking(createdUser.id, createdRoom.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: auxRoom.id });

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});
