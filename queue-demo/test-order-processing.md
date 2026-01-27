# Test Minimal Order Processing System

## Quick Test Guide

### 1. Start the Application

```bash
# Make sure Redis is running
docker run -d -p 6379:6379 redis:alpine

# Start the NestJS application
cd nest-next-ex/queue-demo
pnpm install
pnpm run start:dev
```

### 2. Create Test Data

```bash
# Run the seeding script
pnpm run seed:test
```

This will output something like:
```
Test user created: { id: 'user-uuid', email: 'test@example.com', name: 'Test User' }
Test order created: { id: 'order-uuid', order_number: 'ORD-1234567890', total_amount: 99.99 }

=== Test Data Created Successfully ===
User ID: abc123-def456-ghi789
User Email: test@example.com
Order ID: xyz789-abc123-def456
Order Number: ORD-1234567890

=== Test the API ===
POST http://localhost:3001/orders/xyz789-abc123-def456/process-payment
```

### 3. Test the Background Job

Use the order ID from step 2:

```bash
# Test with background job (recommended)
curl -X POST http://localhost:3001/orders/YOUR_ORDER_ID/process-payment \
  -H "Content-Type: application/json" \
  -d '{"webhook_data": {"payment_id": "test_payment_123", "amount": 99.99}}'

# Or test direct processing (without background job)
curl -X POST http://localhost:3001/orders/YOUR_ORDER_ID/test-process
```

### 4. Check the Results

#### In the Application Logs:
You should see output like:
```
[OrdersController] Received payment processing request for order: xyz789-abc123-def456
[OrdersController] Background job triggered for order: xyz789-abc123-def456
Starting payment processing for order: xyz789-abc123-def456
Validating order: xyz789-abc123-def456
Order xyz789-abc123-def456 validated successfully
Updating order status to paid: xyz789-abc123-def456
Order xyz789-abc123-def456 marked as paid
Getting user info for order: xyz789-abc123-def456
User info retrieved for: test@example.com
Creating notification for order: xyz789-abc123-def456
Notification created for order: xyz789-abc123-def456
Sending email notification for order: xyz789-abc123-def456
Email would be sent to: test@example.com
Subject: Order Confirmation - #ORD-1234567890
Email notification processed for order: xyz789-abc123-def456
Order payment processing completed successfully: xyz789-abc123-def456
```

#### In the Database:
Check your Supabase dashboard:

1. **Orders table**: The order status should be updated to `paid` and `payment_status` to `paid`
2. **Notifications table**: A new notification should be created with type `payment_success`

### 5. API Response

The API should return:
```json
{
  "success": true,
  "message": "Order payment processing initiated",
  "orderId": "xyz789-abc123-def456"
}
```

## Minimal Database Schema

The system uses only 3 simple tables:

### Users Table
```sql
- id (UUID, primary key)
- email (string, unique)
- name (string)
- created_at (timestamp)
```

### Orders Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- order_number (string, unique)
- status (enum: pending, paid, processing, shipped, delivered, cancelled)
- total_amount (decimal)
- payment_status (enum: pending, paid, failed)
- created_at (timestamp)
- paid_at (timestamp, nullable)
```

### Notifications Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- order_id (UUID, foreign key)
- type (string)
- title (string)
- message (text)
- read (boolean)
- email_sent (boolean)
- created_at (timestamp)
```

## Troubleshooting

### Common Issues:

1. **Redis Connection Error**: Make sure Redis is running on port 6379
2. **Supabase Connection Error**: Check your environment variables in `.env`
3. **Order Not Found**: Make sure you're using the correct order ID from the seeding script
4. **Already Paid Error**: The order can only be processed once. Create a new test order.

### Environment Variables Check:

Make sure these are set in your `.env` file:
```bash
SUPABASE_URL=https://ozzulvxlpleczwbhwtae.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_SJzhRZgltv1G8L6SdvzatQ_POZbWSWP
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Create New Test Data:

If you need fresh test data:
```bash
pnpm run seed:test
```

This creates a new user and order each time you run it.

## What Happens in the Background Job:

1. **Validates Order**: Checks if order exists and isn't already paid
2. **Updates Order Status**: Marks order as paid with timestamp
3. **Gets User Info**: Retrieves user details for email
4. **Creates Notification**: Stores in-app notification
5. **Sends Email**: Prepares and logs email content (in production, would actually send)
6. **Updates Notification**: Marks notification as email sent

## Simplified Features:

- **No complex auth**: Simple user table with email and name only
- **Minimal order data**: Just essential fields for order processing
- **Basic notifications**: Simple notification system without complex metadata
- **Direct database calls**: Uses Supabase REST API directly in background jobs
- **Streamlined workflow**: Focus on core order processing functionality