import { BadRequestException } from '@nestjs/common';

const createBadRequestError = (data: any): BadRequestException => {
  throw new BadRequestException(data);
};

export default createBadRequestError;
