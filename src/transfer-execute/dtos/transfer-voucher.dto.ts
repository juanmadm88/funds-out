import { IsNotEmpty, IsString } from 'class-validator';
/* istanbul ignore file */

export class TransferVoucherDTO {
  @IsNotEmpty()
  @IsString()
  readonly id: string;
}
