import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { BankAccountDTO } from '.';

/* istanbul ignore file */
export class PaymentMethodDetailDTO {
  @ApiProperty({ type: () => BankAccountDTO })
  @Type(() => BankAccountDTO)
  @ValidateNested()
  @IsNotEmpty()
  readonly bank_account: BankAccountDTO;
}
