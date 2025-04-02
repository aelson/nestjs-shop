import { Document } from 'mongoose';

export interface IProduct extends Document {
  readonly name: string;
  readonly description?: string;
  readonly image: string;
  readonly price: number;
  readonly stock: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
