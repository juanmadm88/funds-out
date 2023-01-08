import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { DocumentDTO } from '.';
/* istanbul ignore file */

export class CustomerDTO {
  @Type(() => DocumentDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly identityDocument: DocumentDTO;

  @IsNotEmpty()
  @IsString()
  readonly surname: string;

  @IsNotEmpty()
  @IsString()
  readonly aditionalSurname: string;

  @IsNotEmpty()
  @IsString()
  readonly names: string;
}
