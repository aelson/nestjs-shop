import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartsController } from './controllers/carts.controller';
import { CartsService } from './services/carts.service';
import { CartsRepository } from './repositories/carts.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    HttpModule, // For inter-module communication with products module
  ],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
  exports: [CartsService],
})
export class CartsModule {}
