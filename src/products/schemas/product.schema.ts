import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @ApiProperty({ description: 'Product name', maxLength: 64 })
  @Prop({ required: true, maxlength: 64 })
  name: string;

  @ApiProperty({ description: 'Product description', required: false, maxLength: 2048 })
  @Prop({ maxlength: 2048 })
  description?: string;

  @ApiProperty({ description: 'Product image (base64 data URL)', required: true })
  @Prop({ required: true })
  image: string;

  @ApiProperty({ description: 'Product price', minimum: 0 })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ description: 'Available stock', minimum: 0 })
  @Prop({ required: true, min: 0 })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
