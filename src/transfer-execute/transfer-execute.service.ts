import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILogger, LoggerService } from '../logger/logger.service';
import { AccessTokenService } from '../access-token/access-token.service';
import { FundOutDto } from '../fund-out/dtos';
import { TransferExecuteMapper } from './mapper/transfer-execute.mapper';
import { TransferExecuteDTO } from './dtos';
import { Constants } from '../constants';
import { getHeadersFIF } from '../utils/comon-headers';
import { ProxyService } from '../utils/proxy.service';
import { ResponseDTO } from './dtos/response.dto';
import { ResponseMapper } from './mapper/response.mapper';

@Injectable()
export class TransferExecuteService {
  private logger: ILogger;
  constructor(
    private configService: ConfigService,
    private readonly accessTokenService: AccessTokenService,
    private readonly proxyService: ProxyService
  ) {
    this.logger = new LoggerService(this.constructor.name);
  }

  async get(
    aFundOutDTO: FundOutDto,
    timeout: number,
    transferIdentifier: string
  ): Promise<ResponseDTO> {
    const methodName = Constants.TRANSFER_EXECUTE_SERVICE.GET_METHOD.NAME;
    const dto: TransferExecuteDTO = TransferExecuteMapper.transform(
      aFundOutDTO,
      transferIdentifier
    );
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
      this.logger.info(methodName, 'Calling Transfer Execute Service', request);
      //TODO: REVISAR QUE VALIDACIONES HAY QUE HACER PARA TIRAR BAD REQUESTS
      //COMO HACE EN LA API QUE MIGRO FABRY
      const response: any = await this.proxyService.doRequest(request);
      this.logger.info(
        methodName,
        'Response Received from Transfer Execute Service',
        response
      );
      return ResponseMapper.transform({
        data: aFundOutDTO,
        code: Constants.TRANSFER_EXECUTE_SERVICE.SUCCESS_CODE,
        message: Constants.TRANSFER_EXECUTE_SERVICE.TRANSACTION_OK,
        authorizationCode: response.transfer?.transferId
      });
    } catch (error) {
      this.logger.error(
        methodName,
        'An error ocurred while calling Transfer Execute Service',
        error
      );
      if (error instanceof RequestTimeoutException) {
        this.logger.info(
          methodName,
          `${Constants.TRANSFER_EXECUTE_SERVICE.APPROVE_ERR_REQUEST_TRANSFER} approving TIMEOUT`
        );
        return ResponseMapper.transform({
          data: aFundOutDTO,
          code: Constants.TRANSFER_EXECUTE_SERVICE.SUCCESS_CODE,
          message:
            Constants.TRANSFER_EXECUTE_SERVICE.APPROVE_ERR_REQUEST_TRANSFER,
          authorizationCode: `PY${transferIdentifier}`
        });
      }
      throw error;
    }
  }
  private getHeaders(token: string, aDate: string): any {
    const date = new Date(`${aDate.substring(0, 19)}.000Z`)
      .toISOString()
      .substring(0, 19);
    const commerce = this.configService.get(
      'appConfig.transfer_execute.commerce'
    );
    const country = this.configService.get('appConfig.country').toUpperCase();
    const channel = this.configService.get(
      'appConfig.transfer_execute.channel'
    );
    return getHeadersFIF({ token, commerce, channel, date, country });
  }
  private buildRequest(args: any): any {
    const { timeout, token, date, dto } = args;
    return {
      methodToSend: Constants.HTTP_METHOD.POST,
      url: `${this.configService.get('appConfig.transfer_execute.endpoint')}`,
      bodyToSend: dto,
      headersToSend: this.getHeaders(token, date),
      requestTimeout:
        timeout || this.configService.get('appConfig.transfer_execute.timeout')
    };
  }
}
