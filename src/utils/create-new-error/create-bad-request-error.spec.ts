import { BadRequestException } from '@nestjs/common';
import createBadRequestError from './create-bad-request-error';

describe('CreateBadRequestError', () => {
  it('should return error status 400 and be instance of BadRequestException', async () => {
    try {
      const error = {
        code: 400,
        message: 'THIS IS A BAD REQUEST MESSAGE ERROR'
      };
      await createBadRequestError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toBeDefined;
      expect(error.status).toBe(400);
    }
  });
});
