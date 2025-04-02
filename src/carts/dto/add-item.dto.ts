import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ description: 'Product ID to add to cart' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
