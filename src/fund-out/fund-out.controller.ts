import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Headers
} from '@nestjs/common';
import { CheckCountryMiddleware } from '../middlewares/check.country.middleware';
import { ILogger, LoggerService } from '../logger/logger.service';
import { FundOutDto } from './dtos/fund-out.dto';
import { CheckTimeoutMiddleware } from '../middlewares/check.timeout.middleware';
import { ApiHeader } from '@nestjs/swagger';
import { CheckApiKeyMiddleware } from '../middlewares/check.api.key.middleware';
import { CustomerInterbankInfoService } from '../customer-interbank-info/customer-interbank-info.service';
import { ResponseDTO } from '../transfer-execute/dtos';
import { TransferExecuteService } from '../transfer-execute/transfer-execute.service';
import { ProducerService } from '../rabbit-mq/producer.service';
import { Constants } from '../constants';
@Controller('fund-out')
@UseInterceptors(
  CheckCountryMiddleware,
  CheckTimeoutMiddleware,
  CheckApiKeyMiddleware
)
export class FundOutController {
  private logger: ILogger;
  constructor(
    private readonly customerInterbankInfo: CustomerInterbankInfoService,
    private readonly transferExcecute: TransferExecuteService,
    private readonly producer: ProducerService
  ) {
    this.logger = new LoggerService(this.constructor.name);
  }
  @ApiHeader({
    name: 'x-flow-country',
    required: true,
    example: 'pe',
    description: `Add variable 'pe' for x-flow-country`
  })
  @ApiHeader({
    name: 'x-flow-timeout',
    required: false,
    example: '1000',
    description: `Add variable '1000' for x-flow-timeout`
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    example: 'Bearer 1234',
    description: `Add variable 'Bearer 1234' for Authorization`
  })
  @Post('/create-transaction')
  async createTransaction(
    @Body() fundOutDTO: FundOutDto,
    @Headers('x-flow-timeout') timeout: number
  ): Promise<any> {
    let transactionIdentifier: string;
    try {
      this.producer.publishToTransactionProcessor({
        type: Constants.REQUEST_TO_INTERBANK_INFO,
        data: fundOutDTO,
        retry: true
      });
      const response: any = await this.customerInterbankInfo.get(
        fundOutDTO,
        timeout
      );
      transactionIdentifier = response?.transfer?.transferId;
    } catch (error) {
      this.producer.publishToTransactionProcessor({
        type: Constants.RESPONSE_FROM_INTERBANK_INFO,
        data: fundOutDTO,
        error,
        retry: true
      });
      throw error;
    }
    try {
      const result: ResponseDTO = await this.transferExcecute.get(
        fundOutDTO,
        timeout,
        transactionIdentifier
      );
      this.producer.publishToTransactionProcessor({
        type: Constants.RESPONSE_FROM_TRANSFER_EXECUTE,
        data: result,
        retry: true
      });
      return result;
    } catch (error) {
      this.producer.publishToTransactionProcessor({
        type: Constants.RESPONSE_FROM_TRANSFER_EXECUTE,
        data: fundOutDTO,
        error,
        retry: true
      });
      throw error;
    }
  }
}
