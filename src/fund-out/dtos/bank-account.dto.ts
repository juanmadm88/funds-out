import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';
import { OwnerDTO } from './owner.dto';
import buildRegularExpression from '../../utils/build-regular-expression';
const onlyNumbers = buildRegularExpression();

/* istanbul ignore file */
export class BankAccountDTO {
  @ApiProperty({ type: () => OwnerDTO })
  @Type(() => OwnerDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly owner: OwnerDTO;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(onlyNumbers)
  readonly account_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(onlyNumbers)
  readonly destination_account_id: string;
}
