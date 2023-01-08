import { ForbiddenException } from '@nestjs/common';

const createForbiddenError = (data: any): ForbiddenException => {
  throw new ForbiddenException(data);
};

export default createForbiddenError;
