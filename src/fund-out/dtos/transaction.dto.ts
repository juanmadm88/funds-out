import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested
} from 'class-validator';
import { AmountDTO } from './amount.dto';
import buildRegularExpression from '../../utils/build-regular-expression';
const longIsoFormat = buildRegularExpression(
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z|z)?)$/
);
/* istanbul ignore file */
export class TransactionDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly unique_id: string;

  @ApiProperty({
    example: '2022-12-29T17:34:17.401Z',
    description: 'An ISO 8601 date time formatted'
  })
  @IsString()
  @IsNotEmpty()
  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(longIsoFormat)
  readonly datetime: string;

  @ApiProperty({ type: () => AmountDTO })
  @Type(() => AmountDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly amount: AmountDTO;
}
