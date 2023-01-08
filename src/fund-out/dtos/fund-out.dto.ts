import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { MetadataDTO, TransactionDTO } from '.';

/* istanbul ignore file */
export class FundOutDto {
  @ApiProperty({ type: () => TransactionDTO })
  @Type(() => TransactionDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly transaction: TransactionDTO;

  @ApiProperty({ type: () => MetadataDTO })
  @Type(() => MetadataDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly metadata: MetadataDTO;

  @ApiProperty({ example: 'FUNDS_OUT' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['FUNDS_OUT'])
  readonly transaction_type: string;
}
