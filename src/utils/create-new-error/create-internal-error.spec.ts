import { InternalServerErrorException } from '@nestjs/common';
import createInternalError from './create-internal-error';

describe('CreateInternalError', () => {
  it('should return error status 500 and be instance of InternalServerErrorException', async () => {
    try {
      const error = { code: 500, message: 'THIS IS AN INTERNAL MESSAGE ERROR' };
      await createInternalError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error).toBeDefined;
      expect(error.status).toBe(500);
    }
  });
});
