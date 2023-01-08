import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AmountDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly total: number;
}
