import { ProducerService } from './producer.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { rabbitPublishEvent } from 'fif-payments-module-rabbit';
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
jest.mock('fif-payments-module-rabbit', () => {
  const mockeRabbitConnection = {
    getConnection: jest.fn().mockImplementation(() => Promise.resolve('ok')),
    getChannel: jest.fn(),
    createChannels: jest.fn()
  };
  return {
    rabbitConnection: mockeRabbitConnection,
    rabbitPublishEvent: jest.fn()
  };
});

const mockedRabbitPublishEvent = rabbitPublishEvent as jest.Mocked<
  typeof rabbitPublishEvent
>;

describe('ProducerService ', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  let service: ProducerService;
  beforeEach(async () => {
    (mockedRabbitPublishEvent as jest.Mocked<any>).mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProducerService, ConfigService]
    }).compile();
    service = module.get<ProducerService>(ProducerService);
  });
  it('expect service to be defined', () => {
    expect(service).toBeDefined();
  });
  describe('publishToTransactionProcessor method ', () => {
    it('expect publishMessage to be called when retry argument is set false/undefined', async () => {
      mockedRabbitPublishEvent.mockImplementationOnce(() =>
        Promise.resolve('event sended')
      );
      const data = 'data';
      const spy = jest.spyOn(
        ProducerService.prototype as any,
        'publishMessage'
      );
      await service.publishToTransactionProcessor({ data });
      expect(spy).toBeCalledTimes(1);
    });
    it('expect publishMessage to be called twice ', async () => {
      mockedRabbitPublishEvent.mockImplementationOnce(() =>
        Promise.reject({ error: 'some error' })
      );
      const data = 'data';
      const spy = jest.spyOn(
        ProducerService.prototype as any,
        'publishMessage'
      );
      await service.publishToTransactionProcessor({ data, retry: true });
      expect(spy).toBeCalledTimes(2);
    });
    it('expect error to be returned, when calling publishMessage without retrying option ', async () => {
      mockedRabbitPublishEvent.mockImplementationOnce(() =>
        Promise.reject({ error: 'some error' })
      );
      const data = 'data';
      try {
        await service.publishToTransactionProcessor({ data });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
