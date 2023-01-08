import { IsNotEmpty, IsString } from 'class-validator';
/* istanbul ignore file */

export class DocumentDTO {
  @IsNotEmpty()
  @IsString()
  readonly documentType: string;

  @IsNotEmpty()
  @IsString()
  readonly documentNumber: string;
}
