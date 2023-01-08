import {
  FundOutDto,
  BankAccountDTO,
  OwnerDTO,
  MetadataDTO,
  PaymentMethodDetailDTO,
  PayerDTO,
  TransactionDTO,
  AmountDTO
} from './index';

describe('Index Dtos ', () => {
  it('should expect dtos to be defined', () => {
    expect(FundOutDto).toBeDefined();
    expect(BankAccountDTO).toBeDefined();
    expect(OwnerDTO).toBeDefined();
    expect(MetadataDTO).toBeDefined();
    expect(PaymentMethodDetailDTO).toBeDefined();
    expect(PayerDTO).toBeDefined();
    expect(TransactionDTO).toBeDefined();
    expect(AmountDTO).toBeDefined();
  });
});
