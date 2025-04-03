import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoTestModule, closeMongoConnection } from './utils/mongo-test.module';
import { AppModule } from '../src/app.module';
import { CreateProductDto } from '../src/products/dtos/create-product.dto';
import { HttpExceptionFilter } from '../src/common/exceptions/http-exception.filter';

describe('Products E2E Tests', () => {
  let app: INestApplication;
  let productId: string;

  // Sample product data
  const productData: CreateProductDto = {
    name: 'Test Product',
    description: 'This is a test product',
    image:
      'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    price: 19.99,
    stock: 100,
  };

  // Set up the application
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongoTestModule, AppModule],
    }).compile();

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

    expect(productResponse.body).toHaveProperty('_id');
    expect(productResponse.body.name).toBe(productData.name);
    expect(productResponse.body.price).toBe(productData.price);
    expect(productResponse.body.stock).toBe(productData.stock);

    productId = productResponse.body._id;
  });

  afterAll(async () => {
    await app.close();
    await closeMongoConnection();
  });

  describe('Product Creation', () => {
    it('should reject invalid product data', async () => {
      // Missing required fields
      await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: 'Invalid Product',
          // Missing other required fields
        })
        .expect(400);

      // Invalid price (negative)
      await request(app.getHttpServer())
        .post('/api/products')
        .send({
          ...productData,
          price: -10,
        })
        .expect(400);

      // Invalid stock (negative)
      await request(app.getHttpServer())
        .post('/api/products')
        .send({
          ...productData,
          stock: -5,
        })
        .expect(400);
    });
  });

  describe('Product Retrieval', () => {
    it('should get a product by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', productId);
      expect(response.body.name).toBe(productData.name);
    });

    it('should return 404 for non-existent product ID', async () => {
      // Create a valid but non-existent ObjectId by changing the last character
      const nonExistentId = productId.replace(/.$/, '9');
      await request(app.getHttpServer()).get(`/api/products/${nonExistentId}`).expect(404);
    });

    it('should return 400 for invalid product ID format', async () => {
      await request(app.getHttpServer()).get('/api/products/invalid-id').expect(400);
    });

    it('should get all products with pagination', async () => {
      const response = await request(app.getHttpServer()).get('/api/products').expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should filter products by search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?search=Test')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].name).toContain('Test');
    });
  });

  describe('Product Update', () => {
    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 29.99,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
      // Stock should remain unchanged
      expect(response.body.stock).toBe(productData.stock);
    });

    it('should reject invalid update data', async () => {
      await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send({
          price: -10, // Invalid negative price
        })
        .expect(400);
    });
  });

  describe('Product Deletion', () => {
    it('should delete a product', async () => {
      await request(app.getHttpServer()).delete(`/api/products/${productId}`).expect(204);

      // Verify product was deleted
      await request(app.getHttpServer()).get(`/api/products/${productId}`).expect(404);
    });
  });
});
