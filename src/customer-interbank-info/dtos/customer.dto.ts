import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { DocumentDTO } from '.';
/* istanbul ignore file */

export class CustomerDTO {
  @IsNotEmpty()
  @IsString()
  readonly customerType: string;

  @Type(() => DocumentDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly identityDocument: DocumentDTO;
}
