import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApplicationError, RequestError } from '@/protocols';

export function handleApplicationErrors(
  err: ApplicationError | Error | RequestError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err.name === 'CannotEnrollBeforeStartDateError') {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: err.message,
    });
  }

  if (err.name === 'ConflictError' || err.name === 'DuplicatedEmailError') {
    return res.status(httpStatus.CONFLICT).send({
      message: err.message,
    });
  }

  if (err.name === 'InvalidCredentialsError') {
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: err.message,
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(httpStatus.NOT_FOUND).send({
      message: err.message,
    });
  }

  if (err.name === 'PaymentRequiredError') {
    return res.status(httpStatus.PAYMENT_REQUIRED).send({
      message: err.message,
    });
  }

  if (err.name === 'ForbiddenBookingError') {
    return res.status(httpStatus.FORBIDDEN).send({
      message: err.message,
    });
  }

  /* eslint-disable-next-line no-console */
  console.error(err.name);
  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
    error: 'InternalServerError',
    message: 'Internal Server Error',
  });
}
