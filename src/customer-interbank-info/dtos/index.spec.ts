import 'reflect-metadata';
import {
  AccountDTO,
  CustomerDTO,
  OriginDTO,
  CurrencyDTO,
  TransferDTO,
  CustomerInterbankInfoDTO,
  DestinyDTO,
  DocumentDTO
} from './index';

describe('Index Dtos ', () => {
  it('should expect dtos to be defined', () => {
    expect(AccountDTO).toBeDefined();
    expect(CustomerDTO).toBeDefined();
    expect(OriginDTO).toBeDefined();
    expect(CurrencyDTO).toBeDefined();
    expect(TransferDTO).toBeDefined();
    expect(CustomerInterbankInfoDTO).toBeDefined();
    expect(DestinyDTO).toBeDefined();
    expect(DocumentDTO).toBeDefined();
  });
});
