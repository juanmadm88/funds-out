import { Module } from '@nestjs/common';
import { AccessTokenService } from '../access-token/access-token.service';
import { ProxyService } from '../utils/proxy.service';
import { CustomerInterbankInfoService } from '../customer-interbank-info/customer-interbank-info.service';
import { FundOutController } from './fund-out.controller';
import { TransferExecuteService } from '../transfer-execute/transfer-execute.service';
import { ProducerService } from '../rabbit-mq/producer.service';

@Module({
  controllers: [FundOutController],
  providers: [
    CustomerInterbankInfoService,
    AccessTokenService,
    ProxyService,
    TransferExecuteService,
    ProducerService
  ]
})
export class FundOutModule {}
