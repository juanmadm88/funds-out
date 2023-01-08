import { UnauthorizedException } from '@nestjs/common';
import createUnauthorizedError from './create-unauthorized-error';

describe('CreateUnauthorizedError', () => {
  it('should return error status 401 and be instance of UnauthorizedException', async () => {
    try {
      const error = { code: 401, message: 'THIS IS AN UNAUTHORIZED EXCEPTION' };
      await createUnauthorizedError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error).toBeDefined;
      expect(error.status).toBe(401);
    }
  });
});
