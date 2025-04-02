import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'The ID of the product',
    example: '612f5940b81e8a001fc599a2',
  })
  @IsString()
  @MaxLength(40)
  readonly productId: string;
}

export class CreateCartDto {}
