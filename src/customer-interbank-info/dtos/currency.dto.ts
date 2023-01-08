import { IsNotEmpty, IsString } from 'class-validator';
/* istanbul ignore file */

export class CurrencyDTO {
  @IsNotEmpty()
  @IsString()
  readonly code: string;
}
