# Database Schema Design

## Overview

This document outlines the MongoDB schema design for the Shop API application.

## Collections

### Products Collection

Stores information about available products:

```
{
  _id: ObjectId,
  name: String,         // max 64 chars, required
  description: String,  // max 2048 chars, optional
  image: String,        // base64 data URL, < 1MB
  price: Number,        // required, positive
  stock: Number,        // required, non-negative
  createdAt: Date,
  updatedAt: Date
}
```

### Carts Collection

Stores shopping cart information:

```
{
  _id: ObjectId,
  items: [
    {
      productId: ObjectId,  // reference to Products collection
      quantity: Number,     // positive integer
      name: String,         // product name at time of adding
      price: Number         // product price at time of adding
    }
  ],
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships

- Each cart can contain multiple products (embedded as items)
- Each item in the cart references a product from the Products collection

## Indexes

### Products Collection
- `_id`: default primary key

### Carts Collection
- `_id`: default primary key
- `items.productId`: to optimize queries for specific products in carts

## Constraints

1. Product name must be 64 characters or less
2. Product description must be 2048 characters or less
3. Product image must be less than 1MB in size
4. Product price must be a positive number
5. Product stock must be a non-negative number
6. Cart item quantity must be a positive integer

## Notes on Implementation

- When adding a product to a cart, we will check if there is sufficient stock
- When removing a product from a cart, we will restore the stock
- For resilience, product name and price are duplicated in the cart to maintain historical data
- Transactions will be used for operations that affect both cart and product stock
```