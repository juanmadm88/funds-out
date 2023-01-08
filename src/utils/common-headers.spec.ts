import {
  FIFHeaders,
  getHeadersFIF,
  getHeadersInterBankInfo,
  InterBankInfoHeaders
} from './comon-headers';

describe('CommonHeaders', () => {
  it('expect InterBankInfoHeaders to be defined ', () => {
    const args: any = {
      token: 'some token',
      branch: 'some branch',
      channel: 'some channel',
      date: 'some date'
    };
    const headers: InterBankInfoHeaders = getHeadersInterBankInfo(args);
    expect(headers).toBeDefined();
  });
  it('expect FIFHeaders to be defined ', () => {
    const args: any = {
      country: 'a country',
      commerce: 'some commerce',
      channel: 'some channel',
      date: 'some date',
      token: 'some token'
    };
    const headers: FIFHeaders = getHeadersFIF(args);
    expect(headers).toBeDefined();
  });
});
