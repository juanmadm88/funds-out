import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PaymentMethodDetailDTO, PayerDTO } from '.';

/* istanbul ignore file */
export class MetadataDTO {
  @ApiProperty({ type: () => PaymentMethodDetailDTO })
  @Type(() => PaymentMethodDetailDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly payment_method_details: PaymentMethodDetailDTO;

  @ApiProperty({ type: () => PayerDTO })
  @Type(() => PayerDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly payer: PayerDTO;

  @ApiProperty({ example: 'TEF' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['TEF'])
  readonly payment_method: string;
}
