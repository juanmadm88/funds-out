import 'reflect-metadata';
import { FundOutDto } from 'src/fund-out/dtos';
import { TransferExecuteDTO } from '../dtos';
import { TransferExecuteMapper } from './transfer-execute.mapper';

describe('TransferExecuteMapper ', () => {
  it('should expect to be defined', () => {
    expect(TransferExecuteDTO).toBeDefined();
  });
  it('expect a result to be defined ', () => {
    const data: FundOutDto = {
      transaction_type: 'FUNDS_OUT',
      transaction: {
        unique_id: '1234',
        datetime: '2022-11-04T13:59:50-05:00',
        amount: { total: 123 }
      },
      metadata: {
        payment_method: 'TEF',
        payer: {},
        payment_method_details: {
          bank_account: {
            account_id: '1',
            destination_account_id: '2',
            owner: {
              document_type: 'DNI',
              document_number: '123'
            }
          }
        }
      }
    };
    const transferIdentifier = '12345';
    const result: TransferExecuteDTO = TransferExecuteMapper.transform(
      data,
      transferIdentifier
    );
    expect(result).toBeDefined();
  });
});
