import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { CreateCartDto, CreateCartItemDto } from '../dtos/create-cart.dto';
import { CartItemDocument } from '../schemas/cart-item.schema';

@Injectable()
export class CartsRepository {
  constructor(@InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const newCart = new this.cartModel(createCartDto);
    return await newCart.save();
  }

  async findOne(id: string): Promise<CartDocument | null> {
    return await this.cartModel.findById(id).exec();
  }

  async findCartItemById(cartId: string, itemId: string): Promise<CartItemDocument | null> {
    const result = await this.cartModel
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(cartId) } },
        { $unwind: '$items' },
        { $match: { 'items._id': new mongoose.Types.ObjectId(itemId) } },
        { $project: { item: '$items', _id: 0 } },
      ])
      .exec();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return result.length > 0 ? result[0].item : null;
  }

  async addItem(
    cartId: string,
    createCartItemDto: CreateCartItemDto,
    price: number,
    productName: string,
  ): Promise<Cart | null> {
    return await this.cartModel
      .findByIdAndUpdate(
        cartId,
        {
          $push: {
            items: {
              productId: createCartItemDto.productId,
              quantity: 1,
              price: price,
              productName: productName,
            },
          },
          $inc: { totalPrice: price },
        },
        { new: true },
      )
      .exec();
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<Cart | null> {
    const updatedCart = await this.cartModel
      .findOneAndUpdate(
        { _id: cartId, 'items._id': itemId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true },
      )
      .exec();

    if (!updatedCart) return null;

    await this.recalculateCartTotal(cartId);

    return updatedCart;
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart | null> {
    const updatedCart = await this.cartModel
      .findByIdAndUpdate(cartId, { $pull: { items: { _id: itemId } } }, { new: true })
      .exec();

    if (!updatedCart) return null;

    await this.recalculateCartTotal(cartId);

    return updatedCart;
  }

  async remove(id: string): Promise<Cart | null> {
    return await this.cartModel.findByIdAndDelete(id).exec();
  }

  async recalculateCartTotal(cartId: string): Promise<Cart | null> {
    const cart = await this.cartModel.findById(cartId).exec();
    if (!cart) return null;

    const totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return await this.cartModel
      .findByIdAndUpdate(cartId, { $set: { totalPrice: totalPrice } }, { new: true })
      .exec();
  }
}
