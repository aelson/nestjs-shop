import { Document } from 'mongoose';
import { CartItem } from '../schemas/cart-item.schema';

export interface ICart extends Document {
  readonly items: CartItem[];
  readonly totalPrice: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  recalculateTotal(): void;
}
