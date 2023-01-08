import { rabbitConnection } from 'fif-payments-module-rabbit';
import { InitProducer } from './initializer';

jest.mock('fif-payments-module-rabbit', () => {
  const mockeRabbitConnection = {
    getConnection: jest.fn(),
    getChannel: jest.fn(),
    createChannels: jest.fn(),
    createExchanges: jest.fn(),
    createQueues: jest.fn(),
    bind: jest.fn()
  };
  return {
    rabbitConnection: mockeRabbitConnection,
    rabbitPublishEvent: jest.fn()
  };
});

const mockedRabbitConnection = rabbitConnection as jest.Mocked<
  typeof rabbitConnection
>;

const aRabbitConfig: any = {
  config: {
    user: 'guest',
    pass: 'guest',
    server: '127.0.0.1',
    port: '5672',
    vhost: '/',
    protocol: 'amqp',
    delayTimeReq: 1000,
    delayTimeRes: 5000
  },
  channel: {
    transaction: {
      id: 'transaction-channel'
    }
  },
  exchanges: [
    {
      name: 'process-transaction-exchange',
      type: 'fanout',
      channelId: 'transaction-channel'
    }
  ],
  queues: [{ name: 'transaction-log-queue' }]
};

describe('InitProducer', () => {
  beforeEach(async () => {
    (mockedRabbitConnection as jest.Mocked<any>).getConnection.mockReset();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect connection to be stablished ok ', async () => {
    mockedRabbitConnection.getConnection.mockImplementationOnce(() =>
      Promise.resolve('ok')
    );
    InitProducer.init(aRabbitConfig);
  });
  it('expect error when bind method fails ', async () => {
    mockedRabbitConnection.bind.mockImplementationOnce(() =>
      Promise.reject({ error: 'SOME_ERROR' })
    );
    try {
      await InitProducer.init(aRabbitConfig);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect error when getConnection method fails ', async () => {
    mockedRabbitConnection.getConnection.mockImplementationOnce(() =>
      Promise.reject({ error: 'SOME_ERROR' })
    );
    try {
      await InitProducer.init(aRabbitConfig);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
