import { Constants } from '../../constants';
import { FundOutDto } from 'src/fund-out/dtos';
import { CustomerInterbankInfoDTO } from '../dtos';
//NO USO OPTIONAL CHAINING PORQUE TODOS LOS CAMPOS DEL TRANSACTION DTO
//SE VALIDAN CUANDO RECIBIMOS EL REQUEST
export class CustomerInterbankInfoMapper {
  private static readonly DNI_MAPPER = {
    DNI: '1',
    CE: '4'
  };
  public static transform(data: FundOutDto): CustomerInterbankInfoDTO {
    const paymentMethodDetails = data.metadata.payment_method_details;
    const originCci = paymentMethodDetails.bank_account.account_id;
    const destinationCci =
      paymentMethodDetails.bank_account.destination_account_id;
    const documentType = paymentMethodDetails.bank_account.owner.document_type;
    return {
      origin: {
        customer: {
          customerType: Constants.CREATE_INTERBANK_INFO_BODY.CUSTOMER_TYPE,
          identityDocument: {
            documentType: this.DNI_MAPPER[documentType],
            documentNumber:
              paymentMethodDetails.bank_account.owner.document_number
          }
        },
        account: {
          accountNumber: originCci
        }
      },
      destiny: {
        account: {
          accountNumber: destinationCci,
          isHolder: true
        }
      },
      transfer: {
        currency: {
          code: Constants.CREATE_INTERBANK_INFO_BODY.CURRENCY_CODE
        }
      }
    };
  }
}
