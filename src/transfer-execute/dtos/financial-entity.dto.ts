import { IsNotEmpty, IsString } from 'class-validator';
/* istanbul ignore file */

export class FinancialEntityDTO {
  @IsNotEmpty()
  @IsString()
  readonly code: string;
}
