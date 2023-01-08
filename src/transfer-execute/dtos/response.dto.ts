import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { TransactionDTO } from '../dtos/transaction.dto';
/* istanbul ignore file */

export class ResponseDTO {
  @IsNotEmpty()
  @IsString()
  readonly transaction_type: string;

  @IsNotEmpty()
  @IsString()
  readonly payment_method: string;

  @IsNotEmpty()
  @IsString()
  readonly response_code: string;

  @IsNotEmpty()
  @IsString()
  readonly response_description: string;

  @Type(() => TransactionDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly transaction: TransactionDTO;
}
