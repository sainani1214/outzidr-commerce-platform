import fp from 'fastify-plugin';
import { FastifyInstance, FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../utils/errors';
import { ValidationError as ValidatorError } from '../utils/validators';

export const errorHandler = fp(async (app: FastifyInstance) => {
  app.setErrorHandler((error: Error | FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
    app.log.error({
      err: error,
      request: {
        method: request.method,
        url: request.url,
        tenantId: request.tenantId,
      },
    });

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.message,
        statusCode: error.statusCode,
      });
    }

    if (error instanceof ValidatorError) {
      return reply.status(400).send({
        error: error.message,
        details: error.details,
        statusCode: 400,
      });
    }

    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: error.validation,
        statusCode: 400,
      });
    }

    if ((error as any).code === 11000) {
      const field = Object.keys((error as any).keyPattern || {})[0];
      let message = 'Resource already exists';
      
      if (field === 'email') {
        message = 'User with this email already exists';
      } else if (field === 'tenantId' || (error as any).keyPattern?.userId) {
        message = 'A cart already exists for this user';
      }
      
      return reply.status(409).send({
        error: message,
        statusCode: 409,
      });
    }

    if (error.message?.includes('jwt') || error.message?.includes('token')) {
      return reply.status(401).send({
        error: 'Invalid or expired token',
        statusCode: 401,
      });
    }

    if ('statusCode' in error && error.statusCode === 429) {
      return reply.status(429).send({
        error: error.message || 'Too many requests',
        statusCode: 429,
      });
    }

    const statusCode = ('statusCode' in error && typeof error.statusCode === 'number') ? error.statusCode : 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error' 
      : error.message;

    return reply.status(statusCode).send({
      error: message,
      statusCode,
    });
  });
});
