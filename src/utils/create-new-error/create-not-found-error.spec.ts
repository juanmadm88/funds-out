import { NotFoundException } from '@nestjs/common';
import createNotFoundError from './create-not-found-error';

describe('CreateNotFoundError', () => {
  it('should return error status 404 and be instance of NotFoundException', async () => {
    try {
      const error = { code: 404, message: 'THIS IS A NOT FOUND MESSAGE ERROR' };
      await createNotFoundError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error).toBeDefined;
      expect(error.status).toBe(404);
    }
  });
});
