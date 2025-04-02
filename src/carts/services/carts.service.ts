import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartsRepository } from '../repositories/carts.repository';
import { CreateCartDto, CreateCartItemDto } from '../dtos/create-cart.dto';
import { Cart } from '../schemas/cart.schema';
import { MongoHelper } from '../../common/utils/mongo.helper';
import { UpdateItemQuantityDto } from '../dtos/update-item-quantity.dto';
import { HttpService } from '@nestjs/axios';
import { ProductDocument } from 'src/products/schemas/product.schema';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CartsService {
  private apiBaseUrl: string;

  constructor(
    private readonly cartsRepository: CartsRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('API_BASE_URL', 'http://localhost:3000/api');
  }

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

  async getProductById(productId: string): Promise<ProductDocument> {
    const productResponse = await firstValueFrom(
      this.httpService.get(`${this.apiBaseUrl}/products/${productId}`),
    );

    if (!productResponse || !productResponse.data) {
      throw new NotFoundException(`Failed to fetch product details for ID ${productId}`);
    }

    const product: ProductDocument = productResponse.data as ProductDocument;

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.stock < 1) {
      throw new BadRequestException(`Insufficient stock for product ${product.name}.`);
    }

    return product;
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    const productResponse = await firstValueFrom(
      this.httpService.patch(`${this.apiBaseUrl}/products/${productId}`, {
        stock: quantity,
      }),
    );

    if (!productResponse || !productResponse.data) {
      throw new NotFoundException(`Failed to update product stock for ID ${productId}`);
    }
  }

  async addItem(cartId: string, createCartItemDto: CreateCartItemDto): Promise<Cart> {
    this.validateObjectId(cartId);
    this.validateObjectId(createCartItemDto.productId);

    const product = await this.getProductById(createCartItemDto.productId);

    const cart = await this.cartsRepository.findOne(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === createCartItemDto.productId,
    );
    if (existingItem) {
      throw new BadRequestException(`Product ${product.name} is already in the cart.`);
    }

    const updatedCart = await this.cartsRepository.addItem(
      cartId,
      createCartItemDto,
      product.price,
      product.name,
    );
    if (!updatedCart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    await this.updateProductStock(createCartItemDto.productId, product.stock - 1);

    return updatedCart;
  }

  async removeItem(cartId: string, itemId: string): Promise<void> {
    this.validateObjectId(cartId);
    this.validateObjectId(itemId);

    const result = await this.cartsRepository.removeItem(cartId, itemId);
    if (!result) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    updateCartItemDto: UpdateItemQuantityDto,
  ): Promise<Cart> {
    this.validateObjectId(cartId);
    this.validateObjectId(itemId);

    const item = await this.cartsRepository.findCartItemById(cartId, itemId);
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    const product = await this.getProductById(item.productId);

    const quantityDifference = updateCartItemDto.quantity - item.quantity;

    if (quantityDifference > product.stock) {
      throw new BadRequestException(`Insufficient stock for product ${product.name}.`);
    }

    const newStockQuantity = product.stock - quantityDifference;

    const updatedCart = await this.cartsRepository.updateItemQuantity(
      cartId,
      itemId,
      updateCartItemDto.quantity,
    );

    if (!updatedCart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    await this.updateProductStock(product._id as string, newStockQuantity);

    return updatedCart;
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
