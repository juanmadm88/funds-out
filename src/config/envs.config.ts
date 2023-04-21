const baseConfig = {
  app_name: process.env.APP_NAME || 'api-interop',
  express_port: parseInt(process.env.EXPRESS_PORT) || 8080,
  fastify_port: parseInt(process.env.FASTIFY_PORT) || 8080,
  black_list: process.env.BLACKLIST_DATA || 'test,test',
  country: process.env.NODE_APP_COUNTRY || 'pe',
  env: process.env.NODE_ENV || 'local',
  app_version: process.env.npm_package_version,
  timeout_connection: parseInt(process.env.TIMEOUT_CONNECTION) || 10000,
  authorization: {
    enabled: process.env.AUTHORIZATION_ENABLED
      ? JSON.parse(process.env.AUTHORIZATION_ENABLED)
      : true,
    api_key: process.env.AUTHORIZATION_API_KEY || '1234'
  },
  token_service: {
    endpoint:
      process.env.TOKEN_SERVICE_API_TOKEN_ENDPOINT ||
      '',
    expiration_minutes:
      parseInt(process.env.TOKEN_SERVICE_API_TOKEN_EXPIRY_MINUTES, 10) || 10,
    api_key:
      process.env.TOKEN_SERVICE_API_APIKEY ||
      '',
    auth_header:
      process.env.TOKEN_SERVICE_API_AUTH_HEADER ||
      '',
    timeout:
      parseInt(process.env.TOKEN_SERVICE_API_REQUEST_TIMEOUT, 10) || 100000
  },
  get_customer_interbank_info: {
    branch: process.env.GET_CUSTOMER_INTERBANK_INFO_BRANCH || '054',
    channel: process.env.GET_CUSTOMER_INTERBANK_INFO_CHANNEL || 'Mobile',
    endpoint:
      process.env.GET_CUSTOMER_INTERBANK_INFO_ENDPOINT ||
      '',
    timeout:
      parseInt(process.env.GET_CUSTOMER_INTERBANK_INFO_TIMEOUT, 10) || 10000
  },
  transfer_execute: {
    endpoint:
      process.env.TRANSFER_EXECUTE_ENDPOINT ||
      '',
    channel: process.env.TRANSFER_EXECUTE_CHANNEL || 'Payments',
    commerce: process.env.TRANSFER_EXECUTE_COMMERCE || 'Banco',
    timeout: parseInt(process.env.TRANSFER_EXECUTE_TIMEOUT, 10) || 10000
  },
  rabbitConfig: {
    config: {
      user: process.env.RABBIT_USER || 'guest',
      pass: process.env.RABBIT_PASS || 'guest',
      server: process.env.RABBIT_HOST || '127.0.0.1',
      port: process.env.RABBIT_PORT || '5672',
      vhost: process.env.RABBIT_VHOST || '/',
      protocol: process.env.RABBIT_PROTOCOL || 'amqp',
      delayTimeReq: process.env.NODE_DELAY_TIME_REQ || 1000,
      delayTimeRes: process.env.NODE_DELAY_TIME_RES || 5000
    },
    channel: {
      transaction: {
        id: process.env.CHANNEL_TRANSACTION_ID || ''
      }
    },
    exchanges: [
      {
        name:
          process.env.EXCHANGE_PROCESS_TRANSACTION ||
          '',
        type: 'fanout',
        channelId: process.env.CHANNEL_TRANSACTION_ID || ''
      }
    ],
    queues: [
      { name: process.env.QUEUE_TRANSACTION_LOG || '' }
    ]
  }
};

const setVarsEnv = (aditionalEnvConfig = {}) => {
  return { ...baseConfig, aditionalEnvConfig };
};

export const environmentConfig = {
  local: setVarsEnv(),
  test: setVarsEnv(),
  int: setVarsEnv(),
  qa: setVarsEnv(),
  prod: setVarsEnv()
};
