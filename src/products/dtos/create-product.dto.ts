import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { MaxBase64Size } from 'src/common/validators/base64-size.validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Organic Banana',
  })
  @IsString()
  @MaxLength(64)
  readonly name: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Fresh organic bananas from Ecuador',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  readonly description?: string;

  @ApiProperty({
    description: 'Product image (base64 data URL)',
  })
  @IsString()
  @MaxBase64Size(1)
  readonly image: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 1.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiProperty({
    description: 'The quantity available in stock',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  readonly stock: number;
}
