import { NotFoundException } from '@nestjs/common';

const createNotFoundError = (data: any): NotFoundException => {
  throw new NotFoundException(data);
};

export default createNotFoundError;
