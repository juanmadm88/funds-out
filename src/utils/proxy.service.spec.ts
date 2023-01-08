import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Constants } from '../constants';
import { ProxyService } from './proxy.service';
import { axiosClient } from '@payments/http-client';

jest.mock('@payments/http-client', () => ({
  axiosClient: {
    request: jest.fn()
  }
}));

jest.mock('@payments/common-logger', () => {
  const mockedLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  const mockedLoggerFactory = {
    getLogger: () => mockedLogger
  };
  const nodeFunctions = {
    asyncHookCreate: jest.fn(),
    traceMiddleware: () => {
      return jest.fn();
    },
    getTraceHeaders: jest.fn(),
    Logger: mockedLoggerFactory
  };
  return {
    node: nodeFunctions,
    obfuscate: jest.fn(),
    setLoggerConfig: jest.fn()
  };
});

const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe('ProxyService', () => {
  let proxy: ProxyService;
  beforeEach(async () => {
    (mockedAxios as jest.Mocked<typeof axiosClient>).request.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxyService, ConfigService]
    }).compile();

    proxy = await module.get<ProxyService>(ProxyService);
  });
  it('expect to be defined', () => {
    expect(proxy).toBeDefined();
  });
  describe('isJSONParse Method', () => {
    it('expect to return false when argument can´t be parsed', () => {
      expect(proxy.isJSONParse(undefined)).toBe(false);
    });
    it('expect to return true when argument can be parsed', () => {
      const objectToParse: any = JSON.stringify({ colour: 'red' });
      expect(proxy.isJSONParse(objectToParse)).toBe(true);
    });
  });
  describe('buildCode Method', () => {
    it('expect someCode when someCode is not included in TIME_OUT_CODES=["ETIMEDOUT","ECONNABORTED"]', () => {
      const someCode = 'this is a code';
      expect(proxy.buildCode(someCode)).toBe(someCode);
    });
    it('expect to return "ERROR_OF_TIMEOUT" ', () => {
      const someCode = Constants.ETIMEDOUT;
      expect(proxy.buildCode(someCode)).toBe(Constants.ERROR_OF_TIMEOUT);
    });
  });
  describe('isTimeoutError Method', () => {
    it('expect to be false, when error.stack is not defined', () => {
      const anError: any = {};
      expect(proxy.isTimeoutError(anError)).toBe(false);
    });
    it('expect to be false, when error.stack doesn´t include "Error: timeout" ', () => {
      const anError: any = { stack: 'something else' };
      expect(proxy.isTimeoutError(anError)).toBe(false);
    });
    it('expect to be true, when error.code is "ETIMEDOUT" ', () => {
      const anError: any = { code: Constants.ETIMEDOUT };
      expect(proxy.isTimeoutError(anError)).toBe(true);
    });
    it('expect to false, when error is undefined ', () => {
      const anError: any = undefined;
      expect(proxy.isTimeoutError(anError)).toBe(false);
    });
  });
  describe('buildStatusError Method', () => {
    it('expect to be "ERROR_OF_TIMEOUT" , when error.stack is "Error: timeout" ', () => {
      const anError: any = { stack: 'Error: timeout' };
      expect(proxy.buildStatusError(anError)).toBe(Constants.ERROR_OF_TIMEOUT);
    });
    it('expect to be undefined when error is undefined ', () => {
      const anError: any = undefined;
      expect(proxy.buildStatusError(anError)).toBe(undefined);
    });
    it('expect to be "some status" when error response status is "some status" ', () => {
      const anError: any = { response: { status: 'some status' } };
      expect(proxy.buildStatusError(anError)).toBe(anError.response.status);
    });
  });
  describe('buildMessage Method', () => {
    it('expect stringified body when error code is "NOT_CODE" and body is defined ', () => {
      const args: any = {
        body: { data: 'some data' },
        code: Constants.NOT_CODE
      };
      expect(proxy.buildMessage(args)).toBe(JSON.stringify(args.body));
    });
    it('expect generic message when error code is "NOT_CODE" and body is not defined ', () => {
      const url = 'generic url';
      const genericMessage = `Error when do request ${url}`;
      const args: any = {
        body: undefined,
        code: Constants.NOT_CODE,
        url
      };
      expect(proxy.buildMessage(args)).toBe(genericMessage);
    });
    it('expect message "this is a message" when error code is not defined ', () => {
      const message = 'this is a message';
      const args: any = {
        message
      };
      expect(proxy.buildMessage(args)).toBe(message);
    });
    it('expect generic message "this is a message" when error code is not defined and message is not defined ', () => {
      const url = 'generic url';
      const genericMessage = `Error when do request ${url}`;
      const args: any = {
        url
      };
      expect(proxy.buildMessage(args)).toBe(genericMessage);
    });
  });
  describe('processError Method', () => {
    it('expect code equals not code and generic message when error is not defined ', () => {
      const url = 'some url';
      const result: any = proxy.processError(undefined, url);
      const genericMessage = `Error when do request ${url}`;
      expect(result.code).toBe(Constants.NOT_CODE);
      expect(result.message).toBe(genericMessage);
    });
    it('expect to return an object with code and message fields when receiving a proper stringified body ', () => {
      const url = 'some url';
      const code: any = 'some code';
      const message: any = 'some message';
      const aStringifiedError: string = JSON.stringify({ code, message });
      const result: any = proxy.processError(aStringifiedError, url);
      expect(result.code).toBe(code);
      expect(result.message).toBe(message);
    });
    it('expect to return an object with code and message fields when receiving a proper stringified body ', () => {
      const url = 'some url';
      const error_code: any = 'some code';
      const error_description: any = 'some message';
      const aStringifiedError: string = JSON.stringify({
        error_code,
        error_description
      });
      const result: any = proxy.processError(aStringifiedError, url);
      expect(result.code).toBe(error_code);
      expect(result.message).toBe(error_description);
    });
  });
  describe('handlerError Method', () => {
    it('expect Bad Request Error when error response status is equal 400 ', async () => {
      try {
        const error: any = { response: { status: 400 } };
        await proxy.handlerError(error, 'some url');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
    it('expect Not Found Error when error response code is equal "ENOTFOUND" ', async () => {
      try {
        const error: any = { code: Constants.ENOTFOUND };
        await proxy.handlerError(error, 'some url');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('expect Internal Server Error when error response status is not defined ', async () => {
      try {
        const error: any = { response: { status: undefined } };
        await proxy.handlerError(error, 'some url');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('expect Timeout Error ', async () => {
      try {
        const error: any = { stack: 'Error: timeout' };
        error.response = { data: { message: 'CUSTOM MESSAGE' } };
        await proxy.handlerError(error, 'some url');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestTimeoutException);
      }
    });
  });
  describe('buildHeaders Method', () => {
    it('expect DEFAULT_HEADERS ', async () => {
      const headers: any = proxy.buildHeaders(undefined);
      expect(headers).toBe(Constants.DEFAULT_HEADERS);
    });
    it('expect certain headers ', async () => {
      const certainHeaders: any = { 'api-key': 'some api key' };
      const headers: any = proxy.buildHeaders(certainHeaders);
      expect(headers).toBe(certainHeaders);
    });
  });
  describe('buildRequest Method', () => {
    it('expect a request with certain attributes ', async () => {
      const url = 'some url';
      const method = 'POST';
      const body = { attribute: 'some attribute' };
      const headers = { 'api-key': 'some api key' };
      const timeout = 4000;
      const request = proxy.buildRequest({
        url,
        method,
        body,
        headers,
        timeout
      });
      expect(request).toBeDefined();
      expect(request.data).toBe(body);
      expect(request.method).toBe(method);
      expect(request.headers).toBe(headers);
      expect(request.timeout).toBe(timeout);
      expect(request.url).toBe(url);
    });
    it('expect a request without body ', async () => {
      const url = 'some url';
      const method = 'POST';
      const headers = { 'api-key': 'some api key' };
      const timeout = 4000;
      const request = proxy.buildRequest({ url, method, headers, timeout });
      expect(request).toBeDefined();
      expect(request.data).toBeUndefined();
      expect(request.method).toBe(method);
      expect(request.headers).toBe(headers);
      expect(request.timeout).toBe(timeout);
      expect(request.url).toBe(url);
    });
  });
  describe('doRequest Method', () => {
    it('expect mocked result, when axios client service response is mocked ', async () => {
      const mockedResponse = { data: { key: 'asd', id: 1 } };
      mockedAxios.request.mockImplementationOnce(() =>
        Promise.resolve(mockedResponse)
      );
      const url = 'some url';
      const method = 'POST';
      const body = { attribute: 'some attribute' };
      const headers = { 'api-key': 'some api key' };
      const timeout = 4000;
      const result = await proxy.doRequest({
        url,
        method,
        body,
        headers,
        timeout
      });
      expect(result).toBe(mockedResponse.data);
    });
    it('expect error message ', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            code: 'TEST_CODE',
            message: 'TEST_MESSAGE'
          }
        }
      };
      mockedAxios.request.mockImplementationOnce(() => Promise.reject(error));
      const url = 'some url';
      const method = 'POST';
      const body = { attribute: 'some attribute' };
      const headers = { 'api-key': 'some api key' };
      const timeout = 4000;
      await expect(
        (proxy as any).doRequest({
          url,
          method,
          body,
          headers,
          timeout
        })
      ).rejects.toThrow('TEST_MESSAGE');
    });
  });
});
