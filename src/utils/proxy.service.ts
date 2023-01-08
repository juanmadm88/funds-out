import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Constants } from '../constants';
import { ILogger, LoggerService } from '../logger/logger.service';
import createNewError from './create-new-error';
import { axiosClient } from '@payments/http-client';

@Injectable()
export class ProxyService {
  private logger: ILogger;
  private readonly TIME_OUT_CODES: string[] = [
    Constants.ETIMEDOUT,
    Constants.ECONNABORTED,
    Constants.ESOCKETTIMEDOUT
  ];
  private readonly ENOTFOUND: string = Constants.ENOTFOUND;
  constructor(private configService: ConfigService) {
    this.logger = new LoggerService(this.constructor.name);
  }
  buildHeaders = (headers: any) => {
    return headers || Constants.DEFAULT_HEADERS;
  };
  buildRequest = (args: any) => {
    const { url, method, headers, body, timeout } = args;
    const request: any = {
      method,
      headers,
      url,
      timeout
    };
    if (body) {
      request.data = body;
    }
    return request;
  };
  doRequest = async (args: any): Promise<any> => {
    const methodName = Constants.PROXY_SERVICE.DO_REQUEST_METHOD.NAME;
    const { url } = args;
    const { methodToSend, bodyToSend, headersToSend, requestTimeout } = args;
    const timeout =
      requestTimeout ||
      this.configService.get<string>('appConfig.timeout_connection');
    const method = methodToSend || Constants.HTTP_METHOD.GET;
    const headers = this.buildHeaders(headersToSend);
    let responseApi = {};
    const requestObject = this.buildRequest({
      url,
      method,
      headers,
      body: bodyToSend,
      timeout
    });
    try {
      this.logger.info(methodName, 'Sending Request ', requestObject);
      const response = await axiosClient.request(requestObject);
      responseApi =
        typeof response.data === 'string'
          ? JSON.parse(response.data)
          : response.data;
      this.logger.info(methodName, 'Returned Response ', responseApi);
      return responseApi;
    } catch (error) {
      this.logger.error(
        methodName,
        'An error ocurred while trying to do request ',
        error
      );
      this.handlerError(error, url);
    }
  };
  isJSONParse = (anElement: any): boolean => {
    try {
      JSON.parse(anElement);
      return true;
    } catch (error) {
      return false;
    }
  };
  buildCode = (someCode: any): any => {
    if (this.TIME_OUT_CODES.includes(someCode)) {
      return Constants.ERROR_OF_TIMEOUT;
    }
    return someCode;
  };
  buildMessage = (args: any): any => {
    const { body, code, message, url }: any = args;
    const genericMessage = `Error when do request ${url}`;
    if (code === Constants.NOT_CODE) {
      return JSON.stringify(body) || genericMessage;
    }
    return message || genericMessage;
  };
  isTimeoutError = (anError: any): boolean => {
    return (
      !!anError?.stack?.includes('Error: timeout') ||
      this.TIME_OUT_CODES.includes(anError?.code)
    );
  };
  isNotFoundError = (anError: any): boolean => {
    return this.ENOTFOUND === anError?.code;
  };
  processError = (body: any, url: string): any => {
    const error =
      typeof body === 'string' && this.isJSONParse(body)
        ? JSON.parse(body)
        : body;
    const code: any = this.buildCode(
      error?.code || error?.error_code || Constants.NOT_CODE
    );
    const args = {
      code,
      message: error?.message || error?.error_description,
      body,
      url
    };
    const message: string = this.buildMessage(args);
    return {
      code,
      message
    };
  };
  buildStatusError = (anError: any): any => {
    if (this.isTimeoutError(anError)) return Constants.ERROR_OF_TIMEOUT;
    if (this.isNotFoundError(anError)) return Constants.ERROR_NOT_FOUND;
    return anError?.response?.status;
  };
  handlerError = (anError: any, url: string): Promise<HttpException> => {
    const errorData: any = this.processError(
      anError?.response?.data || anError,
      url
    );
    if (
      anError?.response?.status >= 300 ||
      this.isTimeoutError(anError) ||
      this.isNotFoundError(anError)
    ) {
      const statusError: any = this.buildStatusError(anError);
      return createNewError(statusError, errorData);
    }
    return createNewError(Constants.ERROR_OF_CONNECTION, errorData);
  };
}
