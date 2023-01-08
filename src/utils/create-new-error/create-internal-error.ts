import { InternalServerErrorException } from '@nestjs/common';

const createInternalError = (data: any): InternalServerErrorException => {
  throw new InternalServerErrorException(data);
};

export default createInternalError;
