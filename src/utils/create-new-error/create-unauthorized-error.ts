import { UnauthorizedException } from '@nestjs/common';

const createUnauthorizedError = (data: any): UnauthorizedException => {
  throw new UnauthorizedException(data);
};

export default createUnauthorizedError;
