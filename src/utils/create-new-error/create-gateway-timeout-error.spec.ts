import { GatewayTimeoutException } from '@nestjs/common';
import createGatewayTimeoutError from './create-gateway-timeout-error';

describe('CreateGatewayTimeoutError', () => {
  it('should return error status 504 and be instance of GatewayTimeoutException', async () => {
    try {
      const error = {
        code: 504,
        message: 'THIS IS A GATEWAY TIMEOUT MESSAGE ERROR'
      };
      await createGatewayTimeoutError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(GatewayTimeoutException);
      expect(error).toBeDefined;
      expect(error.status).toBe(504);
    }
  });
});
