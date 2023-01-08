import {
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import createNewError from '.';

describe('CreateNewError', () => {
  it('expected Internal Server Error', async () => {
    try {
      const status = 500;
      const error = { code: 500, message: 'THIS IS AN INTERNAL SERVER ERROR' };
      await createNewError(status, error);
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
    }
  });
  it('expected Bad Request Error', async () => {
    try {
      const status = 400;
      const error = {
        code: 400,
        message: 'THIS IS A BAD REQUEST SERVER ERROR'
      };
      await createNewError(status, error);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });
});
