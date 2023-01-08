import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested
} from 'class-validator';
import {
  CurrencyDTO,
  ProductDTO,
  EmailDTO,
  CustomerDTO,
  FinancialEntityDTO
} from '.';
/* istanbul ignore file */

export class DestinyDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @Type(() => ProductDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly product: ProductDTO;

  @Type(() => CurrencyDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly currency: CurrencyDTO;

  @Type(() => EmailDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly email: EmailDTO;

  @Type(() => CustomerDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly customer: CustomerDTO;

  @Type(() => FinancialEntityDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly financialEntity: FinancialEntityDTO;

  @IsString()
  @IsNotEmpty()
  CCI: string;
}
