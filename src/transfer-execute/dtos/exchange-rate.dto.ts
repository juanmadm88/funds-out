import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CurrencyDTO } from '.';
/* istanbul ignore file */

export class ExchangeRateDTO {
  @Type(() => CurrencyDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly currency: CurrencyDTO;

  @IsString()
  @IsNotEmpty()
  readonly exchangeRateAmount: number;
}
