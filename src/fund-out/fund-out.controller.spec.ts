import { FundOutController } from './fund-out.controller';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import {
  CacheModule,
  HttpStatus,
  INestApplication,
  ValidationPipe
} from '@nestjs/common';
import * as request from 'supertest';
import { CheckCountryMiddleware } from '../middlewares/check.country.middleware';
import { ConfigService } from '@nestjs/config';
import { CustomerInterbankInfoService } from '../customer-interbank-info/customer-interbank-info.service';
import { ProxyService } from '../utils/proxy.service';
import { AccessTokenService } from '../access-token/access-token.service';
import { TransferExecuteService } from '../transfer-execute/transfer-execute.service';
import { ProducerService } from '../rabbit-mq/producer.service';

const mockedValidTransaction: any = {
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

describe('FundOutController ', () => {
  let controller: TestingModuleBuilder;
  let app: INestApplication;
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(async () => {
    const customerInterbankInfoService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const transferExecuteService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const producerService = {
      publishToTransactionProcessor: jest.fn()
    };
    controller = Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      controllers: [FundOutController],
      providers: [
        CheckCountryMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'appConfig.country') {
                return 'pe';
              }
              if (key === 'appConfig.authorization') {
                return { enabled: false, api_key: '1234' };
              }
            })
          }
        },
        {
          provide: CustomerInterbankInfoService,
          useValue: customerInterbankInfoService
        },
        ProxyService,
        AccessTokenService,
        {
          provide: TransferExecuteService,
          useValue: transferExecuteService
        },
        {
          provide: ProducerService,
          useValue: producerService
        }
      ]
    });
  });
  const initializeApp = async () => {
    app = (await controller.compile()).createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false
      })
    );
    await app.init();
  };
  it('should expect fund out controller to be defined', () => {
    expect(controller).toBeDefined();
  });
  it('success calling post fund-out/create-transaction, expected 201 status code', async () => {
    await initializeApp();
    return request(app.getHttpServer())
      .post('/fund-out/create-transaction')
      .set('x-flow-country', 'pe')
      .set('x-flow-timeout', '30')
      .send(mockedValidTransaction)
      .then((response) => {
        expect(response.status).toEqual(HttpStatus.CREATED);
      });
  });
  it('expected BAD REQUEST when sending wrong "x-flow-country" header ', async () => {
    await initializeApp();
    return request(app.getHttpServer())
      .post('/fund-out/create-transaction')
      .set('x-flow-country', 'co')
      .send(mockedValidTransaction)
      .then((response) => {
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      });
  });
  it('expected BAD REQUEST when request body is empty ', async () => {
    await initializeApp();
    return request(app.getHttpServer())
      .post('/fund-out/create-transaction')
      .set('x-flow-country', 'pe')
      .set('x-flow-timeout', '30')
      .send({})
      .then((response) => {
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      });
  });
  it('expect error to be thrown when customer interbank info fails ', async () => {
    const producerService = {
      publishToTransactionProcessor: jest.fn()
    };
    const customerInterbankInfoService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.reject({ error: 'SOME_ERROR' }))
    };
    const transferExecuteService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundOutController,
        ConfigService,
        ProxyService,
        {
          provide: CustomerInterbankInfoService,
          useValue: customerInterbankInfoService
        },
        {
          provide: ProducerService,
          useValue: producerService
        },
        {
          provide: TransferExecuteService,
          useValue: transferExecuteService
        }
      ]
    }).compile();
    const controller: FundOutController =
      module.get<FundOutController>(FundOutController);
    try {
      const timeout = 1000;
      await controller.createTransaction(mockedValidTransaction, timeout);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect error to be thrown when transfer execute fails ', async () => {
    const producerService = {
      publishToTransactionProcessor: jest.fn()
    };
    const customerInterbankInfoService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const transferExecuteService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.reject({ error: 'SOME_ERROR' }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundOutController,
        ConfigService,
        ProxyService,
        {
          provide: CustomerInterbankInfoService,
          useValue: customerInterbankInfoService
        },
        {
          provide: ProducerService,
          useValue: producerService
        },
        {
          provide: TransferExecuteService,
          useValue: transferExecuteService
        }
      ]
    }).compile();
    const controller: FundOutController =
      module.get<FundOutController>(FundOutController);
    try {
      const timeout = 1000;
      await controller.createTransaction(mockedValidTransaction, timeout);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
