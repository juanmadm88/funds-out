import { GatewayTimeoutException } from '@nestjs/common';

const createGatewayTimeoutError = (data: any): GatewayTimeoutException => {
  throw new GatewayTimeoutException(data);
};

export default createGatewayTimeoutError;
