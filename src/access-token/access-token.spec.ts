import {
  CACHE_MANAGER,
  ForbiddenException,
  InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from '../utils/proxy.service';
import { AccessTokenService } from './access-token.service';
import { AccessTokenDTO } from './dtos';

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
const mockCacheManager = {
  set: jest.fn(),
  get: jest.fn()
};
const mockedProxyService = {
  doRequest: jest.fn()
};

describe('AccessTokenService', () => {
  beforeEach(async () => {
    (mockCacheManager as jest.Mocked<any>).get.mockReset();
    (mockedProxyService as jest.Mocked<any>).doRequest.mockReset();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenService,
        ConfigService,
        ProxyService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager
        }
      ]
    }).compile();
    const service: AccessTokenService =
      module.get<AccessTokenService>(AccessTokenService);
    expect(service).toBeDefined();
  });
  describe('get method', () => {
    it('expect internal server error when fails to retrieve token from cache', async () => {
      mockCacheManager.get.mockImplementationOnce(() =>
        Promise.reject(new Error('Fallo '))
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccessTokenService,
          ConfigService,
          ProxyService,
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager
          }
        ]
      }).compile();
      const service: AccessTokenService =
        module.get<AccessTokenService>(AccessTokenService);
      try {
        await service.get();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('expect generic error messagge "Error trying to retrieve token from cache"', async () => {
      mockCacheManager.get.mockImplementationOnce(() => Promise.reject());
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccessTokenService,
          ConfigService,
          ProxyService,
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager
          }
        ]
      }).compile();
      const service: AccessTokenService =
        module.get<AccessTokenService>(AccessTokenService);
      try {
        await service.get();
      } catch (error) {
        expect(error.response.message).toBe(
          'Error trying to retrieve token from cache'
        );

        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('expect certain token retrieved from cache', async () => {
      const access_token = 'a token';
      mockCacheManager.get.mockImplementationOnce(() =>
        Promise.resolve(access_token)
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccessTokenService,
          ConfigService,
          ProxyService,
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager
          }
        ]
      }).compile();
      const service: AccessTokenService =
        module.get<AccessTokenService>(AccessTokenService);
      const token: string = await service.get();
      expect(token).toBe(access_token);
    });
    it('expect generate method to be called when token is not cached', async () => {
      const token: AccessTokenDTO = {
        access_token: 'some_token',
        expires_in: 'some day',
        token_type: 'Bearer'
      };
      mockCacheManager.get.mockImplementationOnce(() =>
        Promise.resolve(undefined)
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccessTokenService,
          ConfigService,
          ProxyService,
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager
          }
        ]
      }).compile();
      const service: AccessTokenService = await module.get<AccessTokenService>(
        AccessTokenService
      );
      const spy = jest
        .spyOn(AccessTokenService.prototype as any, 'generate')
        .mockImplementationOnce(() => token);
      const result: string = await service.get();
      expect(result).toBe('some_token');
      expect(spy).toBeCalledTimes(1);
    });
    it('expect forbidden error ', async () => {
      mockCacheManager.get.mockImplementationOnce(() =>
        Promise.resolve(undefined)
      );
      mockedProxyService.doRequest.mockImplementationOnce(() =>
        Promise.reject(
          new ForbiddenException({
            code: 'NOT_CODE',
            message: '{"error":"Invalid credentials"}'
          })
        )
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccessTokenService,
          ConfigService,
          {
            provide: ProxyService,
            useValue: mockedProxyService
          },
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager
          }
        ]
      }).compile();
      const service: AccessTokenService = await module.get<AccessTokenService>(
        AccessTokenService
      );
      const spy = jest.spyOn(AccessTokenService.prototype as any, 'generate');
      try {
        await service.get();
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(spy).toBeCalledTimes(1);
      }
    });
    it('expect token retrieved from service when is not cached ', async () => {
      mockCacheManager.get.mockImplementationOnce(() =>
        Promise.resolve(undefined)
      );
      mockedProxyService.doRequest.mockImplementationOnce(() =>
        Promise.resolve({ access_token: 'retrieved token from service' })
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccessTokenService,
          ConfigService,
          {
            provide: ProxyService,
            useValue: mockedProxyService
          },
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager
          }
        ]
      }).compile();
      const service: AccessTokenService = await module.get<AccessTokenService>(
        AccessTokenService
      );
      const spy = jest.spyOn(AccessTokenService.prototype as any, 'generate');
      const data: string = await service.get();
      expect(data).toBe('retrieved token from service');
      expect(spy).toBeCalledTimes(1);
    });
  });
});
