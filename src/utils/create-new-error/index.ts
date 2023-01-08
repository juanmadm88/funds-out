import { HttpException } from '@nestjs/common';
import getFileNameByStatus from './get-filename-by-status';

const createNewError = (aStatus: any, anError: any): Promise<HttpException> => {
  const filename = getFileNameByStatus(aStatus);
  const createErrorMethod = require(`./${filename}`).default; // eslint-disable-line

  return createErrorMethod(anError);
};

export default createNewError;
