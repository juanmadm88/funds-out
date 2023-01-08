import { IsNotEmpty, IsString } from 'class-validator';
/* istanbul ignore file */

export class TransactionDTO {
  @IsNotEmpty()
  @IsString()
  readonly unique_id: string;

  @IsNotEmpty()
  @IsString()
  readonly acquirer: string;

  @IsNotEmpty()
  @IsString()
  readonly transaction_datetime: string;

  @IsNotEmpty()
  @IsString()
  readonly authorization_code: string;
}
