import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested
} from 'class-validator';
import { TransferVoucherDTO, OriginDTO, DestinyDTO } from '.';
/* istanbul ignore file */

export class TransferDTO {
  @IsString()
  @IsNotEmpty()
  readonly transferId: string;

  @IsString()
  @IsNotEmpty()
  readonly transferType: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNumber()
  @IsNotEmpty()
  readonly transactionCommission: number;

  @Type(() => TransferVoucherDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly transferVoucher: TransferVoucherDTO;

  @Type(() => OriginDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly origin: OriginDTO;

  @Type(() => DestinyDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly destiny: DestinyDTO;
}
