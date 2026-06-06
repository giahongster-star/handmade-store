# API Contracts Documentation

All requests and responses use JSON. Base URL: `/api/v1`

---

## 1. Product API

### Get Product List
* **Endpoint:** `GET /products`
* **Query Params:**
  * `page` (optional): default `1`
  * `limit` (optional): default `10`
  * `category_id` (optional): filter by category
  * `search` (optional): filter by keyword (name/description)
  * `sort` (optional): default `created_at:desc` (options: `price:asc`, `price:desc`, `created_at:asc`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "category_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      "name": "Handmade Clay Vase",
      "slug": "handmade-clay-vase",
      "description": "Exquisite handmade ceramic vase",
      "price": 25.99,
      "stock": 15,
      "status": "active",
      "attributes": {
        "material": "Clay",
        "height": "20cm",
        "weight": "500g"
      },
      "images": [
        {
          "url": "https://example.com/images/vase1.jpg",
          "is_primary": true
        }
      ],
      "created_at": "2026-06-06T09:00:00Z",
      "updated_at": "2026-06-06T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_records": 120,
    "total_pages": 12
  }
}
```

### Get Product Details
* **Endpoint:** `GET /products/:id` (or `:slug`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "name": "Handmade Clay Vase",
    "slug": "handmade-clay-vase",
    "description": "Exquisite handmade ceramic vase",
    "price": 25.99,
    "stock": 15,
    "status": "active",
    "attributes": {
      "material": "Clay",
      "height": "20cm",
      "weight": "500g"
    },
    "images": [
      {
        "url": "https://example.com/images/vase1.jpg",
        "is_primary": true
      }
    ],
    "created_at": "2026-06-06T09:00:00Z",
    "updated_at": "2026-06-06T09:00:00Z"
  }
}
```

### Create Product
* **Endpoint:** `POST /products`
* **Request Body:**
```json
{
  "category_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  "name": "Handmade Clay Vase",
  "description": "Exquisite handmade ceramic vase",
  "price": 25.99,
  "stock": 15,
  "status": "active",
  "attributes": {
    "material": "Clay",
    "height": "20cm"
  },
  "images": [
    {
      "url": "https://example.com/images/vase1.jpg",
      "is_primary": true
    }
  ]
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
  }
}
```

---

## 2. Cart API

### Get Cart
* **Endpoint:** `GET /cart`
* **Headers:** `Authorization: Bearer <token>` or custom anonymous cart header e.g., `X-Cart-Session-ID: <uuid>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cart_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "items": [
      {
        "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
        "product_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "Handmade Clay Vase",
        "price": 25.99,
        "quantity": 2,
        "primary_image_url": "https://example.com/images/vase1.jpg"
      }
    ],
    "subtotal": 51.98
  }
}
```

### Add Item to Cart
* **Endpoint:** `POST /cart/items`
* **Request Body:**
```json
{
  "product_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "quantity": 2
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Item added/updated in cart"
}
```

### Update Item Quantity
* **Endpoint:** `PUT /cart/items/:id`
* **Request Body:**
```json
{
  "quantity": 3
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart item quantity updated"
}
```

### Remove Item from Cart
* **Endpoint:** `DELETE /cart/items/:id`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

## 3. Order API

### Create Order (Checkout)
* **Endpoint:** `POST /orders`
* **Request Body:**
```json
{
  "cart_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
  "payment_method": "cod",
  "shipping_address": {
    "recipient_name": "Nguyen Van A",
    "phone": "0987654321",
    "address_line": "123 Le Loi Street",
    "city": "Ho Chi Minh City",
    "country": "Vietnam"
  }
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    "order_code": "ORD-1717658932",
    "total_amount": 51.98,
    "shipping_fee": 0.00,
    "status": "pending",
    "payment_status": "pending"
  }
}
```

### Get Order Details
* **Endpoint:** `GET /orders/:id` (or `:code`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    "code": "ORD-1717658932",
    "total_amount": 51.98,
    "shipping_fee": 0.00,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cod",
    "shipping_address": {
      "recipient_name": "Nguyen Van A",
      "phone": "0987654321",
      "address_line": "123 Le Loi Street",
      "city": "Ho Chi Minh City",
      "country": "Vietnam"
    },
    "items": [
      {
        "product_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "Handmade Clay Vase",
        "price": 25.99,
        "quantity": 2
      }
    ],
    "created_at": "2026-06-06T09:05:00Z"
  }
}
```
