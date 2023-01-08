import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Constants } from '../constants';
import { ILogger, LoggerService } from '../logger/logger.service';
import {
  rabbitConnection,
  rabbitPublishEvent
} from 'fif-payments-module-rabbit';

@Injectable()
export class ProducerService {
  private logger: ILogger;
  private transactionProcessorExchange: string;
  constructor(private configService: ConfigService) {
    this.logger = new LoggerService(this.constructor.name);
    this.transactionProcessorExchange = this.configService.get<string>(
      'appConfig.rabbitConfig.exchanges[0].name'
    );
  }
  private isRequest(msg: any): boolean {
    return /(Request)/.test(msg.type);
  }

  private buildXdelay(msg: any, delay: any): number {
    return delay || this.isRequest(msg)
      ? this.configService.get<number>(
          'appConfig.rabbitConfig.config.delayTimeReq'
        )
      : this.configService.get<number>(
          'appConfig.rabbitConfig.config.delayTimeRes'
        );
  }

  private async publishMessage(args: any): Promise<any> {
    const methodName: string = Constants.PRODUCER_SERVICE.PUBLISH_MESSAGE.NAME;
    let response: any;
    const { msg, exchange, retry, delay, routingKey } = args;
    const xroutingKey: string = routingKey || 'transaction.log.queue';
    const xdelay: number = this.buildXdelay(msg, delay);
    const channel = this.configService.get<number>(
      'appConfig.rabbitConfig.channel.transaction.id'
    );
    try {
      this.logger.info(methodName, `send message to exchange='${exchange}'`);
      response = await rabbitPublishEvent(
        exchange,
        channel,
        xroutingKey,
        msg,
        rabbitConnection,
        { headers: { 'x-delay': xdelay } }
      );
      return response;
    } catch (error) {
      this.logger.error(
        methodName,
        `Retry ${retry} - error published message to exchange ${exchange} - check metadata.`,
        error
      );
      if (retry) {
        const rabbitConfig = this.configService.get<any>(
          'appConfig.rabbitConfig'
        );
        await rabbitConnection.getConnection(rabbitConfig, true);
        return this.publishMessage({ msg, exchange, retry: false });
      }
      throw error;
    }
  }

  async publishToTransactionProcessor(args: any): Promise<any> {
    const {
      type,
      data,
      error = false,
      isException = false,
      delay,
      retry
    } = args;
    const msg = { type, data, error, isException };
    await this.publishMessage({
      msg,
      exchange: this.transactionProcessorExchange,
      delay,
      retry
    });
  }
}
