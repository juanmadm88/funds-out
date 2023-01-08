import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import buildRegularExpression from '../../utils/build-regular-expression';
const onlyNumbers = buildRegularExpression();
/* istanbul ignore file */

export class ProductDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(onlyNumbers)
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly productType: string;

  @IsString()
  @IsNotEmpty()
  readonly productSubtype: string;

  @IsString()
  @IsOptional()
  readonly description?: string;
}
