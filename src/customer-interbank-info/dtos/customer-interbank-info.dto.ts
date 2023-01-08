import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { OriginDTO, DestinyDTO, TransferDTO } from '.';
/* istanbul ignore file */

export class CustomerInterbankInfoDTO {
  @Type(() => OriginDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly origin: OriginDTO;

  @Type(() => DestinyDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly destiny: DestinyDTO;

  @Type(() => TransferDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly transfer: TransferDTO;
}
