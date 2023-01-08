import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Constants } from '../constants';
import createUnauthorizedError from '../utils/create-new-error/create-unauthorized-error';
const schemesSupported = new RegExp(/^(Bearer|ApiKey)\s+(.*)/);

@Injectable()
export class CheckApiKeyMiddleware implements NestInterceptor {
  constructor(private configService: ConfigService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const authorization = context.switchToHttp().getRequest()?.headers?.[
      'authorization'
    ];
    const { enabled, api_key } = this.configService.get<any>(
      'appConfig.authorization'
    );
    if (enabled) {
      if (!authorization) {
        createUnauthorizedError({
          code: 'ERROR_NO_AUTHORIZATION',
          message: 'the api key was not found'
        });
      }
      const headerApiKeyValue = this.getApiKeyValue(authorization);
      if (!schemesSupported.test(authorization)) {
        createUnauthorizedError({
          code: Constants.ERROR_NOT_AUTHORIZATION_CODE,
          message: 'the api key format was invalid'
        });
      }
      if (api_key !== headerApiKeyValue) {
        createUnauthorizedError({
          code: Constants.ERROR_NOT_AUTHORIZATION_CODE,
          message: 'api key didnt match'
        });
      }
    }
    return next.handle();
  }
  getApiKeyValue = (authorization: any) => {
    return authorization.split(' ')[1];
  };
}
