export class Constants {
  public static readonly CREATE_BAD_REQUEST_ERROR: string =
    'create-bad-request-error';
  public static readonly CREATE_UNAUTHORIZED_ERROR: string =
    'create-unauthorized-error';
  public static readonly CREATE_FORBIDDEN_ERROR: string =
    'create-forbidden-error';
  public static readonly CREATE_NOT_FOUND_ERROR: string =
    'create-not-found-error';
  public static readonly CREATE_TIMEOUT_ERROR: string = 'create-timeout-error';
  public static readonly CREATE_INTERNAL_ERROR: string =
    'create-internal-error';
  public static readonly CREATE_GATEWAY_TIMEOUT_ERROR: string =
    'create-gateway-timeout-error';
  public static readonly ERROR_OF_TIMEOUT: string = 'ERROR_OF_TIMEOUT';
  public static readonly ERROR_OF_CONNECTION: string = 'ERROR_OF_CONNECTION';
  public static readonly ETIMEDOUT: string = 'ETIMEDOUT';
  public static readonly ESOCKETTIMEDOUT: string = 'ESOCKETTIMEDOUT';
  public static readonly ECONNABORTED: string = 'ECONNABORTED';
  public static readonly ENOTFOUND: string = 'ENOTFOUND';
  public static readonly ERROR_NOT_FOUND: string = 'ERROR_NOT_FOUND';
  public static readonly NOT_CODE: string = 'NOT_CODE';
  public static readonly statusDictionary: object = {
    400: this.CREATE_BAD_REQUEST_ERROR,
    401: this.CREATE_UNAUTHORIZED_ERROR,
    403: this.CREATE_FORBIDDEN_ERROR,
    404: this.CREATE_NOT_FOUND_ERROR,
    408: this.CREATE_TIMEOUT_ERROR,
    500: this.CREATE_INTERNAL_ERROR,
    504: this.CREATE_GATEWAY_TIMEOUT_ERROR,
    ERROR_OF_TIMEOUT: this.CREATE_TIMEOUT_ERROR,
    ERROR_OF_CONNECTION: this.CREATE_INTERNAL_ERROR,
    ERROR_NOT_FOUND: this.CREATE_NOT_FOUND_ERROR
  };
  public static readonly PROXY_SERVICE = {
    DO_REQUEST_METHOD: {
      NAME: 'doRequest'
    }
  };
  public static readonly CREATE_TRANSFER_BODY = {
    DOCTYPE_DNI: '1',
    DOCTYPE_CE: '4',
    CURRENCY_CODE: '1',
    TRANSFER_TYPE: '320',
    DESCRIPTION: 'Fpay Transf.',
    PRODUCT_TYPE: '100',
    PRODUCT_SUB_TYPE: '100-1-13',
    EXCHANGE_RATE_AMOUNT: 3.4,
    COMMISSION: 1
  };
  public static readonly CREATE_INTERBANK_INFO_BODY = {
    CUSTOMER_TYPE: 'N',
    CURRENCY_CODE: '604'
  };
  public static readonly ACCESS_TOKEN_SERVICE = {
    GET_METHOD: {
      NAME: 'get'
    }
  };
  public static readonly REQUEST_TO_INTERBANK_INFO = 'RequestInterbankInfo';
  public static readonly RESPONSE_FROM_INTERBANK_INFO = 'ResponseInterbankInfo';
  public static readonly RESPONSE_FROM_TRANSFER_EXECUTE =
    'ResponseTransferExecute';
  public static readonly ERROR_NOT_AUTHORIZATION_CODE: string =
    'ERROR_NO_AUTHORIZATION';
  public static readonly HTTP_METHOD = {
    GET: 'GET',
    POST: 'POST'
  };
  public static readonly DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };
  public static readonly CUSTOMER_INTERBANK_INFO_SERVICE = {
    GET_METHOD: {
      NAME: 'get'
    }
  };
  public static readonly PRODUCER_SERVICE = {
    PUBLISH_MESSAGE: {
      NAME: 'publishMessage'
    }
  };
  public static readonly INIT_PRODUCER = {
    INIT_METHOD_NAME: 'init',
    NAME: 'InitProducer'
  };
  public static readonly TRANSFER_EXECUTE_SERVICE = {
    GET_METHOD: {
      NAME: 'get'
    },
    APPROVE_ERR_REQUEST_TRANSFER: 'APPROVE_ERR_REQUEST_TRANSFER',
    SUCCESS_CODE: '00',
    ACQUIRER_NAME: 'Banco Falabella',
    TRANSACTION_OK: 'TRANSACCION OK'
  };
}
