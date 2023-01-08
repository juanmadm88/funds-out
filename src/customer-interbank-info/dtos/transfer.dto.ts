import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { CurrencyDTO } from '.';
/* istanbul ignore file */

export class TransferDTO {
  @Type(() => CurrencyDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly currency: CurrencyDTO;
}
