import { RequestTimeoutException } from '@nestjs/common';

const createTimeoutError = (data: any): RequestTimeoutException => {
  throw new RequestTimeoutException(data);
};

export default createTimeoutError;
