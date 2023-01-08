import { CacheModule, HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { CustomerInterbankInfoService } from '../customer-interbank-info/customer-interbank-info.service';
import * as request from 'supertest';
import { FundOutController } from '../fund-out/fund-out.controller';
import { InterceptorMiddleware } from './interceptor.middleware';
import { ProxyService } from '../utils/proxy.service';
import { AccessTokenService } from '../access-token/access-token.service';
import { FundOutDto } from '../fund-out/dtos';
import { TransferExecuteService } from '../transfer-execute/transfer-execute.service';
import { ProducerService } from '../rabbit-mq/producer.service';

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

describe('InterceptorMiddleware ', () => {
  it('should expect to be defined', async () => {
    const interceptor: InterceptorMiddleware = new InterceptorMiddleware();
    expect(interceptor).toBeDefined();
  });
  it('should expect an Error when intercept arguments method are undefined', async () => {
    const interceptor: InterceptorMiddleware = new InterceptorMiddleware();
    try {
      await interceptor.intercept(undefined, undefined);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  describe('intercept ', () => {
    it('expected pipe to be called ', async () => {
      const interceptor: InterceptorMiddleware = new InterceptorMiddleware();
      const executionContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnThis(),
        getClass: jest.fn().mockReturnThis(),
        getHandler: jest.fn().mockReturnThis(),
        getArgs: jest.fn().mockReturnThis(),
        getArgByIndex: jest.fn().mockReturnThis(),
        switchToRpc: jest.fn().mockReturnThis(),
        switchToWs: jest.fn().mockReturnThis(),
        getType: jest.fn().mockReturnThis(),
        getResponse: jest.fn().mockReturnThis()
      };
      const callHandler = {
        handle: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis()
      };
      (callHandler.handle().pipe as jest.Mock<any, any>).mockReturnValueOnce({
        attribute: 'some attribute'
      });
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        body: { data: 'mocked data' },
        headers: { 'x-flow-country': 'pe' }
      });
      const actualValue = await interceptor.intercept(
        executionContext,
        callHandler
      );
      expect(actualValue).toBeDefined();
      expect(callHandler.pipe).toBeCalledTimes(1);
    });
    it('expected BAD REQUEST to be returned ', async () => {
      const customerInterbankInfoService = {
        get: jest.fn()
      };
      const producerService = {
        publishToTransactionProcessor: jest.fn()
      };
      let app: INestApplication;
      const controller: TestingModuleBuilder = Test.createTestingModule({
        imports: [CacheModule.register({ isGlobal: true })],
        controllers: [FundOutController],
        providers: [
          { provide: APP_INTERCEPTOR, useClass: InterceptorMiddleware },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'appConfig.country') {
                  return 'pe';
                }
              })
            }
          },
          {
            provide: CustomerInterbankInfoService,
            useValue: customerInterbankInfoService
          },
          {
            provide: ProducerService,
            useValue: producerService
          },
          ProxyService,
          AccessTokenService,
          TransferExecuteService
        ]
      });
      const initializeApp = async () => {
        app = (await controller.compile()).createNestApplication();
        await app.init();
      };
      await initializeApp();
      return request(app.getHttpServer())
        .post('/fund-out/create-transaction')
        .set('x-flow-country', 'co')
        .send({})
        .then((response) => {
          expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });
    it('expected 200 STATUS OK to be returned ', async () => {
      const customerInterbankInfoService = {
        get: jest.fn().mockImplementationOnce(() => Promise.resolve(true))
      };
      const transferExecuteService = {
        get: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve({ status: 200 }))
      };
      const producerService = {
        publishToTransactionProcessor: jest.fn()
      };
      let app: INestApplication;
      const validBody: FundOutDto = {
        transaction_type: 'FUNDS_OUT',
        transaction: {
          unique_id: '1234',
          datetime: '2022-11-04T13:59:50-05:00',
          amount: { total: 123 }
        },
        metadata: {
          payment_method: 'TEF',
          payer: {},
          payment_method_details: {
            bank_account: {
              account_id: '1',
              destination_account_id: '2',
              owner: {
                document_type: 'DNI',
                document_number: '123'
              }
            }
          }
        }
      };
      const controller: TestingModuleBuilder = Test.createTestingModule({
        imports: [CacheModule.register({ isGlobal: true })],
        controllers: [FundOutController],
        providers: [
          { provide: APP_INTERCEPTOR, useClass: InterceptorMiddleware },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'appConfig.country') {
                  return 'pe';
                }
                if (key === 'appConfig.authorization') {
                  return { enabled: false, api_key: 'sarasa' };
                }
              })
            }
          },
          {
            provide: CustomerInterbankInfoService,
            useValue: customerInterbankInfoService
          },
          {
            provide: ProducerService,
            useValue: producerService
          },
          ProxyService,
          AccessTokenService,
          {
            provide: TransferExecuteService,
            useValue: transferExecuteService
          }
        ]
      });
      const initializeApp = async () => {
        app = (await controller.compile()).createNestApplication();
        await app.init();
      };
      await initializeApp();
      return request(app.getHttpServer())
        .post('/fund-out/create-transaction')
        .send(validBody)
        .set('x-flow-country', 'pe')
        .set('x-flow-timeout', '1000')
        .then((response) => {
          expect(response.statusCode).toBe(HttpStatus.CREATED);
        });
    });
  });
});
