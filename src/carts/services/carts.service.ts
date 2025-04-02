import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartsRepository } from '../repositories/carts.repository';
import { CreateCartDto, CreateCartItemDto } from '../dtos/create-cart.dto';
import { Cart } from '../schemas/cart.schema';
import { MongoHelper } from '../../common/utils/mongo.helper';
import { UpdateItemQuantityDto } from '../dtos/update-item-quantity.dto';
//import { CartItem } from '../schemas/cart-item.schema';

@Injectable()
export class CartsService {
  constructor(private readonly cartsRepository: CartsRepository) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    return await this.cartsRepository.create(createCartDto);
  }

  async getCart(id: string): Promise<Cart> {
    this.validateObjectId(id);

    const cart = await this.cartsRepository.findOne(id);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    return cart;
  }

  async addItem(cartId: string, createCartItemDto: CreateCartItemDto): Promise<Cart> {
    this.validateObjectId(cartId);

    // TODO Validate product exists and has sufficient quantity
    //await this.productsService.checkProductAvailability(itemDto.productId, itemDto.quantity);

    // TODO Get product price from product API
    const price = 123;

    const cart = await this.cartsRepository.addItem(cartId, createCartItemDto, price);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    return cart;
  }

  async removeItem(cartId: string, itemId: string): Promise<void> {
    this.validateObjectId(cartId);
    this.validateObjectId(itemId);

    const result = await this.cartsRepository.removeItem(cartId, itemId);
    if (!result) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async updateItemQuantity(
    cartId: string,
    itemId: string,
    updateCartItemDto: UpdateItemQuantityDto,
  ): Promise<Cart> {
    this.validateObjectId(cartId);
    this.validateObjectId(itemId);

    // const cart = await this.getCart(cartId);
    // TODO find the item by cartId and itemId
    // const cartItem = cart.items.find((item: CartItem) => item._id === itemId);

    // if (!cartItem) {
    //   throw new NotFoundException(`Item with ID ${itemId} not found in cart`);
    // }

    const updatedCart = await this.cartsRepository.updateItemQuantity(
      cartId,
      itemId,
      updateCartItemDto.quantity,
    );
    if (!updatedCart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    return new Cart(); //updatedCart;
  }

  async deleteCart(id: string): Promise<void> {
    this.validateObjectId(id);

    const result = await this.cartsRepository.remove(id);
    if (!result) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
  }

  private validateObjectId(id: string): void {
    if (!MongoHelper.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
  }
}
