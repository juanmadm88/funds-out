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
export class CheckTimeoutMiddleware implements NestInterceptor {
  constructor(private configService: ConfigService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const timeoutHeader = context.switchToHttp().getRequest()?.headers?.[
      'x-flow-timeout'
    ];
    if (
      typeof timeoutHeader === 'string' &&
      (isNaN(Number(timeoutHeader)) || !timeoutHeader)
    ) {
      const error = {
        code: 'ERROR_TIMEOUT_NOT_VALID',
        message: 'The timeout is not correct'
      };
      createBadRequestError(error);
    }
    return next.handle();
  }
}
