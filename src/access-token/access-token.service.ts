import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILogger, LoggerService } from '../logger/logger.service';
import { Cache } from 'cache-manager';
import { AccessTokenDTO } from './dtos';
import { ProxyService } from '../utils/proxy.service';
import { Constants } from '../constants';
import createInternalError from '../utils/create-new-error/create-internal-error';

@Injectable()
export class AccessTokenService {
  private logger: ILogger;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private proxyService: ProxyService
  ) {
    this.logger = new LoggerService(this.constructor.name);
  }

  public async get(): Promise<string> {
    const methodName = Constants.ACCESS_TOKEN_SERVICE.GET_METHOD.NAME;
    let token: string;
    const ttl: number =
      this.configService.get<number>(
        'appConfig.token_service.expiration_minutes'
      ) * 60;

    this.logger.info(methodName, 'Trying to retrieve token ');
    try {
      token = await this.cacheManager.get('token');
      if (token) {
        this.logger.info(methodName, 'Retrieved token from cache ');
        return token;
      }
    } catch (err) {
      const message = 'Error trying to retrieve token from cache';
      this.logger.error(methodName, message, err);
      const error: any = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err?.message ? err.message : message
      };
      createInternalError(error);
    }
    try {
      this.logger.info(methodName, 'Trying to retrieve token from service ');
      const generatedToken: AccessTokenDTO = await this.generate();
      this.logger.info(methodName, 'Token Retrieved from service ');
      await this.cacheManager.set('token', generatedToken.access_token, {
        ttl
      });
      token = generatedToken.access_token;
      return token;
    } catch (e) {
      this.logger.error(
        methodName,
        'Error trying to retrieve token from service ',
        e
      );
      throw e;
    }
  }
  private getHeaders(): any {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': `${this.configService.get(
        'appConfig.token_service.api_key'
      )}`,
      Authorization: `${this.configService.get(
        'appConfig.token_service.auth_header'
      )}`
    };
  }
  private buildRequest(): any {
    return {
      methodToSend: Constants.HTTP_METHOD.POST,
      url: `${this.configService.get('appConfig.token_service.endpoint')}`,
      bodyToSend: 'grant_type=client_credentials',
      headersToSend: this.getHeaders(),
      requestTimeout: this.configService.get('appConfig.token_service.timeout')
    };
  }
  private async generate(): Promise<AccessTokenDTO> {
    try {
      const request: any = this.buildRequest();
      const data = await this.proxyService.doRequest(request);
      const tokenGenerated: AccessTokenDTO = data;
      return tokenGenerated;
    } catch (e) {
      throw e;
    }
  }
}
