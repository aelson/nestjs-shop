import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { CartItem, CartItemSchema } from './cart-item.schema';

export type CartDocument = Cart &
  Document & {
    recalculateTotal: () => void;
  };

@Schema({ timestamps: true })
export class Cart {
  @ApiProperty({ description: 'Array of items in the cart' })
  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @ApiProperty({ description: 'Total price of all items in the cart' })
  @Prop({ default: 0 })
  totalPrice: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.methods.recalculateTotal = function (this: CartDocument) {
  this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

CartSchema.pre('save', function (this: CartDocument) {
  this.recalculateTotal();
});
