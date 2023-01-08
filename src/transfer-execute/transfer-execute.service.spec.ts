import { TransferExecuteService } from './transfer-execute.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../utils/proxy.service';
import { AccessTokenService } from '../access-token/access-token.service';
import { CacheModule, RequestTimeoutException } from '@nestjs/common';
import { FundOutDto } from '../fund-out/dtos';
import { Constants } from '../constants';

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

describe('TransferExecuteService ', () => {
  let service: TransferExecuteService;
  const mockedConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'appConfig.country') {
        return 'pe';
      }
      if (key === 'appConfig.authorization') {
        return { enabled: false, api_key: '1234' };
      }
    })
  };
  it('should expect to be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        TransferExecuteService,
        { provide: ConfigService, useValue: mockedConfigService },
        ProxyService,
        AccessTokenService
      ]
    }).compile();
    service = module.get<TransferExecuteService>(TransferExecuteService);
    expect(service).toBeDefined();
  });
  it('expect error when Access Token Service fails', async () => {
    const timeout = 1000;
    const transferIdentifier = 'some identifier';
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
    const accessTokenService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.reject({ error: 'some error' }))
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        TransferExecuteService,
        { provide: ConfigService, useValue: mockedConfigService },
        ProxyService,
        { provide: AccessTokenService, useValue: accessTokenService }
      ]
    }).compile();
    service = module.get<TransferExecuteService>(TransferExecuteService);
    try {
      await service.get(validBody, timeout, transferIdentifier);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect success when access token service and proxy service return OK', async () => {
    const timeout = 1000;
    const transferIdentifier = 'some identifier';
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
    const accessTokenService = {
      get: jest.fn().mockImplementationOnce(() => Promise.resolve('asdsds'))
    };
    const proxyService = {
      doRequest: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ transfer: { transferId: '1234' } })
        )
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        TransferExecuteService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: ProxyService, useValue: proxyService },
        { provide: AccessTokenService, useValue: accessTokenService }
      ]
    }).compile();
    service = module.get<TransferExecuteService>(TransferExecuteService);
    const response: any = await service.get(
      validBody,
      timeout,
      transferIdentifier
    );
    expect(response).toBeDefined();
    expect(response.response_description).toBe(
      Constants.TRANSFER_EXECUTE_SERVICE.TRANSACTION_OK
    );
  });
  it('expect mocked response when proxy service throws timeout exception', async () => {
    const transferIdentifier = '123345';
    const timeout = 1000;
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
    const accessTokenService = {
      get: jest.fn().mockImplementationOnce(() => Promise.resolve('asdsds'))
    };
    const proxyService = {
      doRequest: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject(new RequestTimeoutException())
        )
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        TransferExecuteService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: ProxyService, useValue: proxyService },
        { provide: AccessTokenService, useValue: accessTokenService }
      ]
    }).compile();
    service = module.get<TransferExecuteService>(TransferExecuteService);
    const response = await service.get(validBody, timeout, transferIdentifier);
    expect(response.transaction.authorization_code).toBe('PY123345');
  });
  it('expect error when proxy service throws a different exception from timeout', async () => {
    const transferIdentifier = '123345';
    const timeout = 1000;
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
    const accessTokenService = {
      get: jest.fn().mockImplementationOnce(() => Promise.resolve('asdsds'))
    };
    const proxyService = {
      doRequest: jest
        .fn()
        .mockImplementationOnce(() => Promise.reject({ error: 'some error' }))
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        TransferExecuteService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: ProxyService, useValue: proxyService },
        { provide: AccessTokenService, useValue: accessTokenService }
      ]
    }).compile();
    service = module.get<TransferExecuteService>(TransferExecuteService);
    try {
      await service.get(validBody, timeout, transferIdentifier);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
