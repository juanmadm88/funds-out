import { Constants } from '../../constants';
import { FundOutDto } from 'src/fund-out/dtos';
import { TransferExecuteDTO } from '../dtos';
import getRandomStan from '../../utils/get-random-stan';
export class TransferExecuteMapper {
  private static readonly DNI_MAPPER = {
    DNI: '1',
    CE: '4'
  };
  static cciToNroCuenta = (cci: string): string => {
    const originCciOffice = cci.substring(3, 6);
    const originCciProduct = cci.substring(6, 8);
    const originCciNroCuenta = cci.substring(10, 18);
    return `${originCciProduct}${originCciOffice}${originCciNroCuenta}`;
  };
  public static transform(
    data: FundOutDto,
    transferIdentifier: string
  ): TransferExecuteDTO {
    const paymentMethodDetails = data.metadata.payment_method_details;
    const originCci = paymentMethodDetails.bank_account.account_id;
    const destinationCci =
      paymentMethodDetails.bank_account.destination_account_id;
    const documentType =
      this.DNI_MAPPER[paymentMethodDetails.bank_account.owner.document_type];
    return {
      transactionIdentifier: data.transaction.unique_id,
      exchangeRate: {
        currency: {
          code: Constants.CREATE_TRANSFER_BODY.CURRENCY_CODE
        },
        exchangeRateAmount: Constants.CREATE_TRANSFER_BODY.EXCHANGE_RATE_AMOUNT
      },
      transfer: {
        transferId: transferIdentifier,
        transferType: Constants.CREATE_TRANSFER_BODY.TRANSFER_TYPE,
        description: Constants.CREATE_TRANSFER_BODY.DESCRIPTION,
        transactionCommission: Constants.CREATE_TRANSFER_BODY.COMMISSION,
        transferVoucher: {
          id: getRandomStan().toString()
        },
        origin: {
          amount: data.transaction.amount.total,
          product: {
            id: this.cciToNroCuenta(originCci),
            productType: Constants.CREATE_TRANSFER_BODY.PRODUCT_TYPE,
            productSubtype: Constants.CREATE_TRANSFER_BODY.PRODUCT_SUB_TYPE
          },
          currency: {
            code: Constants.CREATE_TRANSFER_BODY.CURRENCY_CODE
          },
          email: {
            emailAddress: data.metadata.payer.email
          },
          customer: {
            identityDocument: {
              documentType: documentType,
              documentNumber:
                paymentMethodDetails.bank_account.owner.document_number
            },
            surname: data.metadata.payer.last_name,
            aditionalSurname: '-',
            names: data.metadata.payer.first_name
          },
          financialEntity: {
            code: originCci.substring(0, 3)
          },
          CCI: originCci
        },
        destiny: {
          amount: data.transaction.amount.total,
          product: {
            id: this.cciToNroCuenta(destinationCci),
            productType: Constants.CREATE_TRANSFER_BODY.PRODUCT_TYPE,
            productSubtype: Constants.CREATE_TRANSFER_BODY.PRODUCT_SUB_TYPE,
            description: Constants.CREATE_TRANSFER_BODY.DESCRIPTION
          },
          currency: {
            code: Constants.CREATE_TRANSFER_BODY.CURRENCY_CODE
          },
          email: {
            emailAddress: ''
          },
          customer: {
            identityDocument: {
              documentType: documentType,
              documentNumber:
                paymentMethodDetails.bank_account.owner.document_number
            },
            surname: data.metadata.payer.last_name,
            aditionalSurname: '-',
            names: data.metadata.payer.first_name
          },
          financialEntity: {
            code: destinationCci.substring(0, 3)
          },
          CCI: destinationCci
        }
      }
    };
  }
}
