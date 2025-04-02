import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartsService } from '../services/carts.service';
import { Cart } from '../schemas/cart.schema';
import { CreateCartDto, CreateCartItemDto } from '../dtos/create-cart.dto';
import { UpdateItemQuantityDto } from '../dtos/update-item-quantity.dto';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shopping cart' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Shopping cart created successfully',
    type: Cart,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async createCart(@Body() createCartDto: CreateCartDto): Promise<Cart> {
    return await this.cartsService.create(createCartDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shopping cart by ID' })
  @ApiParam({ name: 'id', description: 'Shopping Cart ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Shopping cart found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Shopping cart not found' })
  async getCart(@Param('id') id: string) {
    return await this.cartsService.getCart(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to shopping cart' })
  @ApiParam({ name: 'id', description: 'Shopping Cart ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item added to cart' })
  async addItemToCart(@Param('id') cartId: string, @Body() itemDto: CreateCartItemDto) {
    return await this.cartsService.addItem(cartId, itemDto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Shopping Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart Item ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Item removed from cart' })
  async removeItem(@Param('id') cartId: string, @Param('itemId') itemId: string) {
    await this.cartsService.removeItem(cartId, itemId);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiParam({ name: 'id', description: 'Shopping Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart Item ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item quantity updated' })
  async updateItemQuantity(
    @Param('id') cartId: string,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateItemQuantityDto,
  ) {
    return await this.cartsService.updateItemQuantity(cartId, itemId, updateCartItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shopping cart' })
  @ApiParam({ name: 'id', description: 'Shopping Cart ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Shopping cart deleted' })
  async deleteCart(@Param('id') id: string) {
    await this.cartsService.deleteCart(id);
  }
}
