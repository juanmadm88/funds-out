import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import createBadRequestError from '../utils/create-new-error/create-bad-request-error';

@Injectable()
export class CheckCountryMiddleware implements NestInterceptor {
  constructor(private configService: ConfigService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const countryHeader = context.switchToHttp().getRequest()?.headers?.[
      'x-flow-country'
    ];
    const countryConfig = this.configService.get<string>('appConfig.country');
    if (!countryHeader) createBadRequestError('The country is mandatory');
    if (countryConfig !== countryHeader)
      createBadRequestError('The country is not correct');
    return next.handle();
  }
}
