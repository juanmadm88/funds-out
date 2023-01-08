import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckTimeoutMiddleware } from './check.timeout.middleware';

let middleware: CheckTimeoutMiddleware;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CheckTimeoutMiddleware,
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn((key: string) => {
            if (key === 'appConfig.country') {
              return 'pe';
            }
          })
        }
      }
    ]
  }).compile();

  middleware = module.get<CheckTimeoutMiddleware>(CheckTimeoutMiddleware);
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

describe('CheckTimeoutMiddleware ', () => {
  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
  describe('intercept Method ', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call next when header is correct ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { 'x-flow-timeout': '30' },
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

    it('should call next when x-flow-timeout is empty', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: {},
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
    it('expect bad request error when x-flow-timeout is wrong', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { 'x-flow-timeout': 'asdw' },
        body: { data: 'mocked data' }
      });
      try {
        middleware.intercept(executionContext, callHandler);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response.message).toBe('The timeout is not correct');
      }
    });
  });
});
