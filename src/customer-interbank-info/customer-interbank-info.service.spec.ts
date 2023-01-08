import { CustomerInterbankInfoService } from './customer-interbank-info.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../utils/proxy.service';
import { AccessTokenService } from '../access-token/access-token.service';
import { CacheModule } from '@nestjs/common';
import { FundOutDto } from 'src/fund-out/dtos';
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

describe('CustomerInterbankInfoService ', () => {
  let service: CustomerInterbankInfoService;
  it('should expect to be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        CustomerInterbankInfoService,
        ConfigService,
        ProxyService,
        AccessTokenService
      ]
    }).compile();
    service = module.get<CustomerInterbankInfoService>(
      CustomerInterbankInfoService
    );
    expect(service).toBeDefined();
  });
  it('expect error when Access Token Service fails', async () => {
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
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.reject({ error: 'some error' }))
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        CustomerInterbankInfoService,
        ConfigService,
        ProxyService,
        { provide: AccessTokenService, useValue: accessTokenService }
      ]
    }).compile();
    service = module.get<CustomerInterbankInfoService>(
      CustomerInterbankInfoService
    );
    try {
      await service.get(validBody, timeout);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect success when access token service and proxy service return OK', async () => {
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
          Promise.resolve({ transfer: { transferId: '12345' } })
        )
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        CustomerInterbankInfoService,
        ConfigService,
        { provide: ProxyService, useValue: proxyService },
        { provide: AccessTokenService, useValue: accessTokenService }
      ]
    }).compile();
    service = module.get<CustomerInterbankInfoService>(
      CustomerInterbankInfoService
    );
    const response: any = await service.get(validBody, timeout);
    expect(response.transfer.transferId).toBe('12345');
  });
  it('expect error when proxy service fails', async () => {
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
        .mockImplementationOnce(() => Promise.reject({ code: 'SOME_CODE' }))
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        CustomerInterbankInfoService,
        ConfigService,
        { provide: ProxyService, useValue: proxyService },
        { provide: AccessTokenService, useValue: accessTokenService }
      ]
    }).compile();
    service = module.get<CustomerInterbankInfoService>(
      CustomerInterbankInfoService
    );
    try {
      await service.get(validBody, timeout);
    } catch (error) {
      expect(error.code).toBe('SOME_CODE');
    }
  });
});
