import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoTestModule, closeMongoConnection } from './utils/mongo-test.module';
import { AppModule } from '../src/app.module';
import { CreateProductDto } from '../src/products/dtos/create-product.dto';
import { HttpExceptionFilter } from '../src/common/exceptions/http-exception.filter';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('Carts E2E Tests', () => {
  let app: INestApplication;
  let cartId: string;
  let productId: string;
  let productItemId: string;

  // Sample product data for testing
  const productData: CreateProductDto = {
    name: 'Test Product for Cart',
    description: 'This is a test product for cart operations',
    image:
      'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    price: 29.99,
    stock: 50,
  };

  // Set up the application
  beforeAll(async () => {
    const mockHttpService = {
      get: jest.fn().mockImplementation((url) => {
        if (url.includes(`/products/${productId}`)) {
          return of({
            data: {
              _id: productId,
              name: productData.name,
              price: productData.price,
              stock: productData.stock,
            }
          });
        }
        return of({ data: null });
      }),
      patch: jest.fn().mockImplementation(() => of({ data: { success: true } }))
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongoTestModule, AppModule],
    })
    .overrideProvider(HttpService)
    .useValue(mockHttpService)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // Create a test product to use in cart tests
    const productResponse = await request(app.getHttpServer())
      .post('/api/products')
      .send(productData)
      .expect(201);
    productId = productResponse.body._id;

    // Create a cart and save the ID
    const cartResponse = await request(app.getHttpServer())
      .post('/api/carts')
      .send({})
      .expect(201);
    expect(cartResponse.body).toHaveProperty('_id');
    expect(cartResponse.body).toHaveProperty('items');
    expect(cartResponse.body.items).toHaveLength(0);
    expect(cartResponse.body.totalPrice).toBe(0);
    cartId = cartResponse.body._id;

    // Add item to the cart
    const itemResponse = await request(app.getHttpServer())
      .post(`/api/carts/${cartId}/items`)
      .send({ productId: productId })
      .expect(201);
    expect(itemResponse.body.items).toHaveLength(1);
    expect(itemResponse.body.items[0].productId).toBe(productId);
    expect(itemResponse.body.items[0].quantity).toBe(1);
    expect(itemResponse.body.items[0].price).toBe(productData.price);
    expect(itemResponse.body.totalPrice).toBe(productData.price);

    // Save the item ID for later tests
    productItemId = itemResponse.body.items[0]._id;
  });

  afterAll(async () => {
    await app.close();
    await closeMongoConnection();
  });

  describe('Add Item to Cart', () => {
    it('should reject adding item with invalid product ID', async () => {
      await request(app.getHttpServer())
        .post(`/api/carts/${cartId}/items`)
        .send({
          productId: 'invalid-product-id',
        })
        .expect(400);
    });

    it('should reject adding item with non-existent product ID', async () => {
      // Generate a valid but non-existent MongoDB ObjectId
      const nonExistentProductId = productId.replace(/.$/, productId.slice(-1) === 'f' ? '0' : 'f');

      await request(app.getHttpServer())
        .post(`/api/carts/${cartId}/items`)
        .send({
          productId: nonExistentProductId,
        })
        .expect(404);
    });
  });

  describe('Get Cart', () => {
    it('should get a cart by ID', async () => {
      const response = await request(app.getHttpServer()).get(`/api/carts/${cartId}`).expect(200);

      expect(response.body._id).toBe(cartId);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.totalPrice).toBe(productData.price);
    });

    it('should return 404 for non-existent cart ID', async () => {
      // Create valid but non-existent ObjectId
      const nonExistentCartId = cartId.replace(/.$/, cartId.slice(-1) === 'f' ? '0' : 'f');

      await request(app.getHttpServer()).get(`/api/carts/${nonExistentCartId}`).expect(404);
    });

    it('should return 400 for invalid cart ID format', async () => {
      await request(app.getHttpServer()).get('/api/carts/invalid-cart-id').expect(400);
    });
  });

  describe('Update Item Quantity', () => {
    it('should update the quantity of an item in the cart', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/carts/${cartId}/items/${productItemId}`)
        .send({
          quantity: 3,
        })
        .expect(200);

      expect(response.body.items[0].quantity).toBe(3);
      expect(response.body.totalPrice).toBe(productData.price * 3);
    });

    it('should reject updating to invalid quantity', async () => {
      await request(app.getHttpServer())
        .patch(`/api/carts/${cartId}/items/${productItemId}`)
        .send({
          quantity: -1,
        })
        .expect(400);
    });

    it('should reject updating to quantity exceeding available stock', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/carts/${cartId}/items/${productItemId}`)
        .send({
          quantity: 100, // More than available stock
        })
        .expect(400);
    });
  });

  describe('Remove Item from Cart', () => {
    it('should remove an item from the cart', async () => {
      await request(app.getHttpServer())
        .delete(`/api/carts/${cartId}/items/${productItemId}`)
        .expect(204);

      // Verify item was removed
      const response = await request(app.getHttpServer()).get(`/api/carts/${cartId}`).expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.totalPrice).toBe(0);
    });
  });

  describe('Delete Cart', () => {
    it('should delete a cart', async () => {
      await request(app.getHttpServer()).delete(`/api/carts/${cartId}`).expect(204);

      // Verify cart was deleted
      await request(app.getHttpServer()).get(`/api/carts/${cartId}`).expect(404);
    });
  });
});
