import { RequestTimeoutException } from '@nestjs/common';
import createTimeOutError from './create-timeout-error';

describe('CreateTimeoutError', () => {
  it('should return error status 408 and be instance of RequestTimeoutException', async () => {
    try {
      const error = { code: 408, message: 'THIS IS A TIMEOUT EXCEPTION' };
      await createTimeOutError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(RequestTimeoutException);
      expect(error).toBeDefined;
      expect(error.status).toBe(408);
    }
  });
});
