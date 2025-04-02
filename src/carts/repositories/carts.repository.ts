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
        // First match the cart by ID
        { $match: { _id: new mongoose.Types.ObjectId(cartId) } },
        // Unwind the items array so each item becomes a separate document
        { $unwind: '$items' },
        // Match the specific item by ID
        { $match: { 'items._id': new mongoose.Types.ObjectId(itemId) } },
        // Project just the item
        { $project: { item: '$items', _id: 0 } },
      ])
      .exec();

    // Return the item if found, otherwise null
    return result.length > 0 ? result[0].item : null;
  }

  async addItem(
    cartId: string,
    createCartItemDto: CreateCartItemDto,
    price: number,
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
            },
          },
        },
        { new: true },
      )
      .exec();
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<Cart | null> {
    return await this.cartModel
      .findOneAndUpdate(
        { _id: cartId, 'items._id': itemId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true },
      )
      .exec();
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart | null> {
    return await this.cartModel
      .findByIdAndUpdate(cartId, { $pull: { items: { _id: itemId } } }, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Cart | null> {
    return await this.cartModel.findByIdAndDelete(id).exec();
  }

  async findByUser(userId: string): Promise<Cart[]> {
    return await this.cartModel.find({ userId }).exec();
  }

  async updateCart(id: string, updateData: Partial<Cart>): Promise<Cart | null> {
    return await this.cartModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async clearCart(id: string): Promise<Cart | null> {
    return await this.cartModel
      .findByIdAndUpdate(id, { $set: { items: [] } }, { new: true })
      .exec();
  }
}
