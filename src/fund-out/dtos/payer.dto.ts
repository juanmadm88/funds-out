import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class PayerDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly last_name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly first_name?: string;
}
