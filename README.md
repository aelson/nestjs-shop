# Shop API

A NestJS-based backend application implementing product management and shopping cart functionalities.

## Description

This project is a Node.js application built using the NestJS framework. It features:

- Product management with CRUD operations
- Shopping cart functionality
- Proper stock management
- Independent modules with zero cohesion
- MongoDB database integration
- Swagger API documentation

## Requirements

- Node.js (v16 or later)
- MongoDB
- Docker and Docker Compose (for containerized deployment)

## Installation

Install dependencies:
```
npm install
```

## Running the app

Build and start using Docker Compose:
```
docker-compose up -d
```

or

Development mode:
```
npm run start:dev
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

http://localhost:3000/api/docs

## Features

### Products Module
- Create, read, update, and delete products
- Validate product data (name, description, price, stock, image)
- Handle product stock management

### Shopping Cart Module
- Create and manage shopping carts
- Add/remove products from carts
- Update product quantities
- Handle stock updates when cart operations occur

## Testing

Run e2e tests:
```
npm run test:e2e
```

Test coverage:
```
npm run test:cov
```

## Project Structure

```
src/
├── products/     # Products module
├── common/       # Utilities module
├── carts/        # Shopping cart module
├── app.module.ts # Main application module
└── main.ts       # Application entry point
test/
├── carts.e2e-spec.ts    # e2e tests for Carts
└── products.e2e-spec.ts # e2e tests for Products
```
