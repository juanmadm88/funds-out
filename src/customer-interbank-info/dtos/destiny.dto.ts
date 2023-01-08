import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { AccountDTO } from '.';
/* istanbul ignore file */

export class DestinyDTO {
  @Type(() => AccountDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly account: AccountDTO;
}
