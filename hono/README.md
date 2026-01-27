# Hono + Inngest Integration

A TypeScript project demonstrating Hono.js with Inngest for background job processing.

## Setup

```bash
npm install
```

## Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## Endpoints

- `GET /` - API information
- `POST /trigger/hello` - Trigger a hello world event
- `POST /trigger/order` - Trigger an order processing event
- `/api/inngest` - Inngest endpoint for function execution

## Testing Inngest Functions

### Trigger Hello World Event

```bash
curl -X POST http://localhost:3000/trigger/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

### Trigger Order Processing Event

```bash
curl -X POST http://localhost:3000/trigger/order \
  -H "Content-Type: application/json" \
  -d '{"orderId": "order_123", "amount": 250, "userId": "user_456"}'
```

## Inngest Functions

### hello-world
- **Event:** `demo/hello.world`
- Logs a greeting message with the provided name

### process-order
- **Event:** `app/order.created`
- Multi-step function that:
  1. Validates the order
  2. Processes payment
  3. Sends confirmation email

## Local Development with Inngest Dev Server

To test with the Inngest Dev Server:

1. Install Inngest CLI:
```bash
npx inngest-cli dev
```

2. Start your Hono server:
```bash
npm run dev
```

3. Open the Inngest Dev Server at http://localhost:8288

The Dev Server will automatically discover your functions at `http://localhost:3000/api/inngest`.
