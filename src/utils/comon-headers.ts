export type InterBankInfoHeaders = {
  'X-Date-Time': string;
  'X-Channel': string;
  'X-Branch': string;
  Authorization: string;
};

export type FIFHeaders = {
  'X-Channel': string;
  'X-Country': string;
  'X-Commerce': string;
  'X-Date-Time': string;
  Authorization: string;
};

export const getHeadersInterBankInfo = (args: any): InterBankInfoHeaders => {
  const { token, branch, channel, date } = args;
  return {
    'X-Date-Time': date,
    'X-Channel': channel,
    'X-Branch': branch,
    Authorization: `Bearer ${token}`
  };
};

export const getHeadersFIF = (args: any): FIFHeaders => {
  const { country, commerce, channel, date, token } = args;
  return {
    'X-Channel': channel,
    'X-Country': country,
    'X-Commerce': commerce,
    'X-Date-Time': date,
    Authorization: `Bearer ${token}`
  };
};
