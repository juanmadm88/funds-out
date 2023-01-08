import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
/* istanbul ignore file */

export class AccountDTO {
  @IsNotEmpty()
  @IsString()
  readonly accountNumber: string;

  @IsOptional()
  @IsBoolean()
  readonly isHolder?: boolean;
}
