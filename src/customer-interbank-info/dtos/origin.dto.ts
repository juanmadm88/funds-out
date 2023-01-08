import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { CustomerDTO, AccountDTO } from '.';
/* istanbul ignore file */

export class OriginDTO {
  @Type(() => CustomerDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly customer: CustomerDTO;

  @Type(() => AccountDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly account: AccountDTO;
}
