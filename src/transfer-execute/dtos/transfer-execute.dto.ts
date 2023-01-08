import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ExchangeRateDTO, TransferDTO } from '.';
/* istanbul ignore file */

export class TransferExecuteDTO {
  @IsNotEmpty()
  @IsString()
  readonly transactionIdentifier: string;

  @Type(() => ExchangeRateDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly exchangeRate: ExchangeRateDTO;

  @Type(() => TransferDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly transfer: TransferDTO;
}
