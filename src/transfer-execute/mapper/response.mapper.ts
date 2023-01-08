import { Constants } from '../../constants';
import { ResponseDTO } from '../dtos/response.dto';

export class ResponseMapper {
  public static transform(args: any): ResponseDTO {
    const { data, code, message, authorizationCode } = args;
    return {
      transaction_type: data.transaction_type,
      payment_method: data.metadata.payment_method,
      response_code: code,
      response_description: message,
      transaction: {
        unique_id: data.transaction.unique_id,
        acquirer: Constants.TRANSFER_EXECUTE_SERVICE.ACQUIRER_NAME,
        transaction_datetime: data.transaction.datetime,
        authorization_code: authorizationCode
      }
    };
  }
}
