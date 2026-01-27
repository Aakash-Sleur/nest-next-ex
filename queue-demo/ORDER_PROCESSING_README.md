# Minimal Order Processing with Inngest Background Jobs

This implementation provides a streamlined order processing system with background jobs using Inngest and Supabase, focusing on simplicity and core functionality.

## Features

- **Simple Order Processing**: Minimal endpoint to trigger payment processing
- **Background Jobs**: Inngest-powered background processing with retry logic
- **Minimal Database**: Only 3 tables (users, orders, notifications)
- **Basic Email Notifications**: Simple email confirmations (logged, not sent)
- **Clean Architecture**: Focused on essential functionality only

## Workflow

1. **Payment Received** → `POST /orders/{orderId}/process-payment`
2. **Background Job Triggered** → Inngest processes the order
3. **Order Status Updated** → Mark order as paid in database
4. **Email Logged** → Log email content (ready for real email service)
5. **Notification Created** → Store notification in database

## Database Schema (Minimal)

### Users Table
- `id`: UUID primary key
- `email`: User email (unique)
- `name`: User name
- `created_at`: Timestamp

### Orders Table
- `id`: UUID primary key
- `user_id`: Reference to users
- `order_number`: Unique order identifier
- `status`: Order status (pending, paid, etc.)
- `total_amount`: Order total
- `payment_status`: Payment status (pending, paid, failed)
- `created_at`, `paid_at`: Timestamps

### Notifications Table
- `id`: UUID primary key
- `user_id`: Reference to users
- `order_id`: Reference to orders
- `type`: Notification type
- `title`: Notification title
- `message`: Notification content
- `read`: Read status
- `email_sent`: Email sent status
- `created_at`: Timestamp

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase project (see `supabase-schema.sql`)

### 2. Environment Variables

Copy `.env.example` to `.env` and update:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 3. Install & Start

```bash
pnpm install
pnpm run start:dev
```

### 4. Test

```bash
# Create test data
pnpm run seed:test

# Test the API (use order ID from seed output)
curl -X POST http://localhost:3001/orders/{ORDER_ID}/process-payment
```

## API Endpoints

- `POST /orders/{orderId}/process-payment` - Triggers background job
- `POST /orders/{orderId}/test-process` - Direct processing (testing)
- `POST /inngest` - Inngest webhook endpoint

## Background Job Flow

1. **Validate Order** - Check order exists and not already paid
2. **Update Status** - Mark order as paid with timestamp
3. **Get User** - Retrieve user information
4. **Create Notification** - Store in-app notification
5. **Log Email** - Prepare email content (ready for real email service)

## Key Simplifications

- **No complex auth**: Simple user table without OAuth complexity
- **Minimal order data**: Only essential fields for processing
- **Direct API calls**: Uses Supabase REST API in background jobs
- **Email logging**: Prepares email content but doesn't send (easily extensible)
- **Clean interfaces**: Simple TypeScript interfaces matching database schema

## Production Ready

- Proper error handling and logging
- Database transactions and constraints
- Background job retry logic
- Comprehensive TypeScript types
- Easy to extend with real email service