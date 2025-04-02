import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { CartItem, CartItemSchema } from './cart-item.schema';

export type CartDocument = Cart &
  Document & {
    recalculateTotal: () => void;
  };

export enum CartStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Cart {
  @ApiProperty({ description: 'Array of items in the cart' })
  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @ApiProperty({ description: 'Status of the cart', enum: CartStatus })
  @Prop({ type: String, enum: CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus;

  @ApiProperty({ description: 'Total price of all items in the cart' })
  @Prop({ default: 0 })
  totalPrice: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Add a method to recalculate the total price
CartSchema.methods.recalculateTotal = function (this: CartDocument) {
  this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Middleware to automatically recalculate total price before saving
CartSchema.pre('save', function (this: CartDocument) {
  this.recalculateTotal();
});
