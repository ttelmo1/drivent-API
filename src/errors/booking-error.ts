import { ApplicationError } from '@/protocols';

export function forbiddenBookingError(message: string): ApplicationError {
  return {
    name: 'ForbiddenBookingError',
    message: message,
  };
}

export function notFoundBookingError(message: string): ApplicationError {
  return {
    name: 'NotFoundBookingError',
    message: message,
  };
}
