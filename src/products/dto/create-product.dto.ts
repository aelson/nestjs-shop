import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', maxLength: 64 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name: string;

  @ApiProperty({ description: 'Product description', required: false, maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  description?: string;

  @ApiProperty({ description: 'Product image (base64 data URL)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^data:image\/(jpeg|png|gif|bmp);base64,/, {
    message: 'Image must be a valid base64 data URL',
  })
  image: string;

  @ApiProperty({ description: 'Product price', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Available stock', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;
}
