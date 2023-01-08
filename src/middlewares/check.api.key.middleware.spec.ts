import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckApiKeyMiddleware } from './check.api.key.middleware';

let middleware: CheckApiKeyMiddleware;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CheckApiKeyMiddleware,
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn((key: string) => {
            if (key === 'appConfig.authorization') {
              return { enabled: true, api_key: '1234' };
            }
          })
        }
      }
    ]
  }).compile();

  middleware = module.get<CheckApiKeyMiddleware>(CheckApiKeyMiddleware);
});

const executionContext = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
  getArgs: jest.fn().mockReturnThis(),
  getArgByIndex: jest.fn().mockReturnThis(),
  switchToRpc: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  switchToWs: jest.fn().mockReturnThis()
};

const callHandler = {
  handle: jest.fn()
};

describe('CheckApiKeyMiddleware ', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
  describe('CheckApiKeyMiddleware ', () => {
    it('should call next when header is correct ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { authorization: 'Bearer 1234' },
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      const actualValue = await middleware.intercept(
        executionContext,
        callHandler
      );
      expect(actualValue).toBe('next handle');
      expect(callHandler.handle).toBeCalledTimes(1);
    });

    it('should call next when header start with ApiKey at the beginning of the token ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { authorization: 'ApiKey 1234' },
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      const actualValue = await middleware.intercept(
        executionContext,
        callHandler
      );
      expect(actualValue).toBe('next handle');
      expect(callHandler.handle).toBeCalledTimes(1);
    });

    it('should return an especific error when header is empty ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: {},
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      try {
        middleware.intercept(executionContext, callHandler);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e.response.message).toBe('the api key was not found');
      }
    });

    it('should return an especific error when api-key is not correct ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { authorization: 'Bearer sarasa' },
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      try {
        middleware.intercept(executionContext, callHandler);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.response.message).toBe('api key didnt match');
      }
    });
    it('expect api-key invalid format ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { authorization: 'sarasa' },
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      try {
        middleware.intercept(executionContext, callHandler);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.response.message).toBe('the api key format was invalid');
      }
    });
  });
});
