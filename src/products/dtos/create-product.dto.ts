import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Organic Banana',
  })
  @IsString()
  @MaxLength(100)
  readonly name: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Fresh organic bananas from Ecuador',
  })
  @IsString()
  readonly description: string;

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
    default: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  readonly quantity?: number;

  @ApiProperty({
    description: 'URL to the product image',
    example: 'https://example.com/images/banana.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  readonly imageUrl?: string;

  @ApiProperty({
    description: 'Whether the product is active and can be purchased',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @ApiProperty({
    description: 'Categories this product belongs to',
    example: ['fruits', 'organic', 'fresh'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly categories?: string[];
}
