import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
/* istanbul ignore file */

export class EmailDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly emailAddress: string;
}
