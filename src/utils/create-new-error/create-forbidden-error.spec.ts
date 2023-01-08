import { ForbiddenException } from '@nestjs/common';
import createForbiddenError from './create-forbidden-error';

describe('CreateForbiddenError', () => {
  it('should return error status 403 and be instance of ForbiddenException', async () => {
    try {
      const error = { code: 403, message: 'THIS IS FORBIDDEN MESSAGE ERROR' };
      await createForbiddenError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error).toBeDefined;
      expect(error.status).toBe(403);
    }
  });
});
