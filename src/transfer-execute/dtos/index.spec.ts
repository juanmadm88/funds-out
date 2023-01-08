import 'reflect-metadata';
import {
  CurrencyDTO,
  ExchangeRateDTO,
  TransferExecuteDTO,
  TransferDTO,
  TransferVoucherDTO,
  OriginDTO,
  DestinyDTO,
  ProductDTO,
  EmailDTO,
  CustomerDTO,
  DocumentDTO,
  FinancialEntityDTO,
  ResponseDTO,
  TransactionDTO
} from './index';

describe('Index Dtos ', () => {
  it('should expect dtos to be defined', () => {
    expect(ExchangeRateDTO).toBeDefined();
    expect(TransferExecuteDTO).toBeDefined();
    expect(CurrencyDTO).toBeDefined();
    expect(TransferDTO).toBeDefined();
    expect(TransferVoucherDTO).toBeDefined();
    expect(OriginDTO).toBeDefined();
    expect(DestinyDTO).toBeDefined();
    expect(ProductDTO).toBeDefined();
    expect(EmailDTO).toBeDefined();
    expect(CustomerDTO).toBeDefined();
    expect(DocumentDTO).toBeDefined();
    expect(FinancialEntityDTO).toBeDefined();
    expect(ResponseDTO).toBeDefined();
    expect(TransactionDTO).toBeDefined();
  });
});
