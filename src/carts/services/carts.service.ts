import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';

@Injectable()
export class CartsService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  // Implementation will be added in a future commit
}
