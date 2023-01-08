import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';
import * as mapDoctypeCountry from 'fif-payments-map-doctype-country';
const doctypes: any = mapDoctypeCountry.getDocTypeByCountry('pe');
import buildRegularExpression from '../../utils/build-regular-expression';
const onlyNumbers = buildRegularExpression();

/* istanbul ignore file */
export class OwnerDTO {
  @ApiProperty()
  @IsString()
  @IsIn(doctypes)
  @IsNotEmpty()
  readonly document_type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(onlyNumbers)
  readonly document_number: string;
}
