import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../entities/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductQueryDto, SortOrder } from '../dtos/product-query.dto';
import { PaginationHelper } from '../../common/utils/pagination.helper';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ProductsRepository {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(createProductDto);
    return await newProduct.save();
  }

  async findAll(queryDto: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const { search, category, minPrice, maxPrice, active, sortBy, sortOrder, page, limit } =
      queryDto;
    
    // Build query
    const query: any = {};
    
    // Apply filters
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.categories = { $in: [category] };
    }
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.price.$lte = maxPrice;
      }
    }
    
    // Active filter
    if (active !== undefined) {
      query.isActive = active;
    }
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Build sorting
    const sort: any = {};
    sort[sortBy || 'createdAt'] = sortOrder === SortOrder.ASC ? 1 : -1;
    
    // Execute query with pagination
    const [items, totalItems] = await Promise.all([
      this.productModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(query).exec(),
    ]);
    
    // Return paginated results using our helper
    return PaginationHelper.paginate<Product>(items, totalItems, page, limit);
  }

  async findOne(id: string): Promise<Product> {
    return await this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    return await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Product> {
    return await this.productModel.findByIdAndDelete(id).exec();
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return await this.productModel.find({ _id: { $in: ids } }).exec();
  }

  async decreaseQuantity(id: string, quantity: number): Promise<Product> {
    return await this.productModel
      .findByIdAndUpdate(id, { $inc: { quantity: -quantity } }, { new: true })
      .exec();
  }

  async increaseQuantity(id: string, quantity: number): Promise<Product> {
    return await this.productModel
      .findByIdAndUpdate(id, { $inc: { quantity: quantity } }, { new: true })
      .exec();
  }
}
