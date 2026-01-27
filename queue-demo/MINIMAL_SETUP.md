# Minimal Order Processing Setup

## 🎯 What This Does

Simple order processing system that:
1. Receives an order ID via API
2. Marks the order as paid in database
3. Sends email notification (logged)
4. Creates in-app notification

## 📊 Database (3 Simple Tables)

```sql
-- Users: Just email and name
users (id, email, name, created_at)

-- Orders: Basic order info
orders (id, user_id, order_number, status, total_amount, payment_status, created_at, paid_at)

-- Notifications: Simple notifications
notifications (id, user_id, order_id, type, title, message, read, email_sent, created_at)
```

## 🚀 Quick Start

```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:alpine

# 2. Install and start
pnpm install
pnpm run start:dev

# 3. Create test data
pnpm run seed:test

# 4. Test API (use order ID from step 3)
curl -X POST http://localhost:3001/orders/{ORDER_ID}/process-payment
```

## 📁 Key Files

- `supabase-schema.sql` - Minimal database schema
- `src/supabase/supabase.service.ts` - Database operations
- `src/orders/orders.controller.ts` - API endpoints
- `src/inngest/inngest.functions.ts` - Background job logic
- `src/scripts/seed-test-data.ts` - Test data creation

## 🔄 Background Job Flow

1. **Validate** - Check order exists and not paid
2. **Update** - Mark order as paid with timestamp
3. **Notify** - Create notification record
4. **Email** - Log email content (ready for real email service)

## ✨ Features

- ✅ Minimal database schema (no auth complexity)
- ✅ Background job processing with Inngest
- ✅ Error handling and logging
- ✅ TypeScript interfaces
- ✅ Easy to test and extend
- ✅ Production-ready structure

## 🛠 Environment Variables

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## 📝 API Endpoints

- `POST /orders/{id}/process-payment` - Trigger background job
- `POST /orders/{id}/test-process` - Direct processing (testing)
- `POST /inngest` - Inngest webhook

## 🎉 Ready to Use

The system is ready to use with minimal setup. Just run the schema, set environment variables, and start testing!