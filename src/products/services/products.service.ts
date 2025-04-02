import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductQueryDto } from '../dtos/product-query.dto';
import { Product } from '../schemas/product.schema';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { MongoHelper } from '../../common/utils/mongo.helper';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productsRepository.create(createProductDto);
  }

  async findAll(queryDto: ProductQueryDto): Promise<PaginatedResult<Product>> {
    return await this.productsRepository.findAll(queryDto);
  }

  async findOne(id: string): Promise<Product | null> {
    this.validateObjectId(id);

    const product = await this.productsRepository.findOne(id);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    this.validateObjectId(id);

    const product = await this.productsRepository.update(id, updateProductDto);
    return product;
  }

  async remove(id: string): Promise<void> {
    this.validateObjectId(id);

    await this.productsRepository.remove(id);
  }

  async checkProductAvailability(id: string, quantity: number): Promise<boolean> {
    this.validateObjectId(id);

    const product = await this.productsRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock for product ${product.name}.`);
    }

    return true;
  }

  async decreaseStock(id: string, quantity: number): Promise<Product> {
    this.validateObjectId(id);

    await this.checkProductAvailability(id, quantity);

    return await this.productsRepository.decreaseQuantity(id, quantity);
  }

  async increaseStock(id: string, quantity: number): Promise<Product> {
    this.validateObjectId(id);

    const product = await this.productsRepository.increaseQuantity(id, quantity);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  private validateObjectId(id: string): void {
    if (!MongoHelper.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }
  }
}
