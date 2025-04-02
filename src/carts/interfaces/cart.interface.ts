import { Document } from 'mongoose';
import { CartStatus } from '../schemas/cart.schema';
import { CartItem } from '../schemas/cart-item.schema';

export interface ICart extends Document {
  readonly items: CartItem[];
  readonly status: CartStatus;
  readonly totalPrice: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  recalculateTotal(): void;
}
