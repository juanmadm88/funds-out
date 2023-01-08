import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILogger, LoggerService } from '../logger/logger.service';
import { AccessTokenService } from '../access-token/access-token.service';
import { FundOutDto } from '../fund-out/dtos';
import { CustomerInterbankInfoMapper } from './mapper/customer-interbank-info.mapper';
import { CustomerInterbankInfoDTO } from './dtos';
import { Constants } from '../constants';
import { getHeadersInterBankInfo } from '../utils/comon-headers';
import { ProxyService } from '../utils/proxy.service';
@Injectable()
export class CustomerInterbankInfoService {
  private logger: ILogger;
  constructor(
    private configService: ConfigService,
    private readonly accessTokenService: AccessTokenService,
    private readonly proxyService: ProxyService
  ) {
    this.logger = new LoggerService(this.constructor.name);
  }

  async get(aFundOutDTO: FundOutDto, timeout: number): Promise<any> {
    const methodName =
      Constants.CUSTOMER_INTERBANK_INFO_SERVICE.GET_METHOD.NAME;
    const dto: CustomerInterbankInfoDTO =
      CustomerInterbankInfoMapper.transform(aFundOutDTO);
    let token: string;
    try {
      this.logger.info(methodName, 'Calling Access Token Service');
      token = await this.accessTokenService.get();
      this.logger.info(methodName, 'Token retrieved from Access Token Service');
    } catch (error) {
      this.logger.error(
        methodName,
        'An error ocurred while calling Access Token Service ',
        error
      );
      throw error;
    }
    try {
      const date: string = aFundOutDTO.transaction.datetime;
      const request: any = this.buildRequest({ timeout, token, date, dto });
      this.logger.info(
        methodName,
        'Calling Customer Interbank Info Service',
        request
      );
      //TODO: VER SI HAY CASOS QUE DEVUELVEN 200 OK, PERO HAY QUE REINTERPRETARLOS
      // ANALIZANDO EL RESPONSE CODE Y DEVOLVER UN 400 BAD REQUEST, COMO SE HACIA ANTES
      const response: any = await this.proxyService.doRequest(request);
      this.logger.info(
        methodName,
        'Response Received from Customer Interbank Info Service',
        response
      );
      return response;
    } catch (error) {
      this.logger.error(
        methodName,
        'An error ocurred while calling Customer Interbank Info Service',
        error
      );
      throw error;
    }
  }
  private getHeaders(token: string, aDate: string): any {
    const date = new Date(`${aDate.substring(0, 19)}.000Z`).toISOString();
    const branch = this.configService.get(
      'appConfig.get_customer_interbank_info.branch'
    );
    const channel = this.configService.get(
      'appConfig.get_customer_interbank_info.channel'
    );
    return getHeadersInterBankInfo({ token, branch, channel, date });
  }
  private buildRequest(args: any): any {
    const { timeout, token, date, dto } = args;
    return {
      methodToSend: Constants.HTTP_METHOD.POST,
      url: `${this.configService.get(
        'appConfig.get_customer_interbank_info.endpoint'
      )}`,
      bodyToSend: dto,
      headersToSend: this.getHeaders(token, date),
      requestTimeout:
        timeout ||
        this.configService.get('appConfig.get_customer_interbank_info.timeout')
    };
  }
}
