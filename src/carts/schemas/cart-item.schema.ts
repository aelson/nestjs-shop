import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CartItemDocument = CartItem & Document;

@Schema()
export class CartItem {
  @ApiProperty({ description: 'Reference to the product' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @ApiProperty({ description: 'Product name (for display purposes)' })
  @Prop({ required: true })
  productName: string;

  @ApiProperty({ description: 'Product price at the time of adding to cart' })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ description: 'Quantity of the product', minimum: 1 })
  @Prop({ required: true, min: 1 })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
