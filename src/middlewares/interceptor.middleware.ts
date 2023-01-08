import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { ILogger, LoggerService } from '../logger/logger.service';
import { catchError, tap, throwError } from 'rxjs';
//TODO: ENMASCARAR EL BODY DEL REQ
@Injectable()
export class InterceptorMiddleware implements NestInterceptor {
  private logger: ILogger;
  constructor() {
    this.logger = new LoggerService(this.constructor.name);
  }
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const dataLogRequest = {
      path: request.path,
      body: request.body,
      headers: request.headers
    };
    this.logger.info('Intercept', 'Request Data ', dataLogRequest);

    return next.handle().pipe(
      tap(() => {
        this.logger.info(
          'intercept',
          `Logging Response Status Code ${response?.statusCode}`
        );
      }),
      catchError((err) => {
        this.logger.error('intercept', 'Intercepting Error ', err);
        return throwError(() => err);
      })
    );
  }
}
