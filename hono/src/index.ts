import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Inngest } from 'inngest';
import { serve as serveInngest } from 'inngest/hono';

// Dummy in-memory database
const db = {
  users: new Map<string, any>(),
  orders: new Map<string, any>(),
  inventory: new Map<string, any>(),
  transactions: new Map<string, any>()
};

// Initialize some dummy data
db.users.set('user_1', { id: 'user_1', name: 'John Doe', balance: 1000, status: 'active' });
db.users.set('user_2', { id: 'user_2', name: 'Jane Smith', balance: 500, status: 'active' });
db.inventory.set('item_1', { id: 'item_1', name: 'Widget', stock: 50, price: 25 });
db.inventory.set('item_2', { id: 'item_2', name: 'Gadget', stock: 30, price: 50 });

// Helper functions for DB operations
const dbHelpers = {
  getUser: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate DB delay
    return db.users.get(userId);
  },
  updateUser: async (userId: string, updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = db.users.get(userId);
    if (user) {
      db.users.set(userId, { ...user, ...updates });
      return db.users.get(userId);
    }
    return null;
  },
  getInventoryItem: async (itemId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return db.inventory.get(itemId);
  },
  updateInventory: async (itemId: string, updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const item = db.inventory.get(itemId);
    if (item) {
      db.inventory.set(itemId, { ...item, ...updates });
      return db.inventory.get(itemId);
    }
    return null;
  },
  createOrder: async (orderData: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order = { id: orderId, ...orderData, createdAt: new Date().toISOString() };
    db.orders.set(orderId, order);
    return order;
  },
  updateOrder: async (orderId: string, updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const order = db.orders.get(orderId);
    if (order) {
      db.orders.set(orderId, { ...order, ...updates });
      return db.orders.get(orderId);
    }
    return null;
  },
  createTransaction: async (txnData: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const txnId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction = { id: txnId, ...txnData, timestamp: new Date().toISOString() };
    db.transactions.set(txnId, transaction);
    return transaction;
  }
};

const app = new Hono();

// Initialize Inngest client
const inngest = new Inngest({ 
  id: 'hono-app',
  name: 'Hono App'
});

// Define an Inngest function
const helloFunction = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'demo/hello.world' },
  async ({ event, step }) => {
    await step.run('send-greeting', async () => {
      console.log(`Hello, ${event.data.name || 'World'}!`);
      return { message: `Hello, ${event.data.name || 'World'}!` };
    });

    return { success: true };
  }
);

// Define another example function with multiple steps
const processOrderFunction = inngest.createFunction(
  { id: 'process-order' },
  { event: 'app/order.created' },
  async ({ event, step }) => {
    // Step 1: Validate order
    const validationResult = await step.run('validate-order', async () => {
      console.log('Validating order:', event.data.orderId);
      return { valid: true };
    });

    // Step 2: Process payment
    const paymentResult = await step.run('process-payment', async () => {
      console.log('Processing payment for order:', event.data.orderId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return { status: 'completed', transactionId: 'txn_123' };
    });

    // Step 3: Send confirmation
    await step.run('send-confirmation', async () => {
      console.log('Sending confirmation email for order:', event.data.orderId);
      return { emailSent: true };
    });

    return { 
      success: true, 
      orderId: event.data.orderId,
      transaction: paymentResult
    };
  }
);

// Complex multi-step workflow with DB operations
const complexWorkflowFunction = inngest.createFunction(
  { id: 'complex-workflow' },
  { event: 'app/workflow.start' },
  async ({ event, step }) => {
    const { userId, itemId, quantity } = event.data;
    
    // Step 1: Fetch user from DB
    const user = await step.run('fetch-user', async () => {
      console.log(`[Step 1] Fetching user: ${userId}`);
      const userData = await dbHelpers.getUser(userId);
      if (!userData) {
        throw new Error(`User ${userId} not found`);
      }
      console.log(`[Step 1] User fetched:`, userData);
      return userData;
    });

    // Step 2: Fetch inventory item
    const item = await step.run('fetch-inventory', async () => {
      console.log(`[Step 2] Fetching inventory item: ${itemId}`);
      const itemData = await dbHelpers.getInventoryItem(itemId);
      if (!itemData) {
        throw new Error(`Item ${itemId} not found`);
      }
      console.log(`[Step 2] Item fetched:`, itemData);
      return itemData;
    });

    // Step 3: Check stock availability
    const stockCheck = await step.run('check-stock', async () => {
      console.log(`[Step 3] Checking stock for ${quantity} units`);
      const available = item.stock >= quantity;
      console.log(`[Step 3] Stock check: ${available ? 'Available' : 'Insufficient'}`);
      if (!available) {
        throw new Error(`Insufficient stock. Available: ${item.stock}, Requested: ${quantity}`);
      }
      return { available, currentStock: item.stock };
    });

    // Step 4: Calculate total and check user balance
    const financialCheck = await step.run('financial-check', async () => {
      const totalAmount = item.price * quantity;
      console.log(`[Step 4] Total amount: ${totalAmount}, User balance: ${user.balance}`);
      
      if (user.balance < totalAmount) {
        throw new Error(`Insufficient balance. Required: ${totalAmount}, Available: ${user.balance}`);
      }
      
      return { totalAmount, balance: user.balance };
    });

    // Step 5: Create order record
    const order = await step.run('create-order', async () => {
      console.log(`[Step 5] Creating order record`);
      const orderData = {
        userId,
        itemId,
        quantity,
        totalAmount: financialCheck.totalAmount,
        status: 'pending'
      };
      const createdOrder = await dbHelpers.createOrder(orderData);
      console.log(`[Step 5] Order created:`, createdOrder.id);
      return createdOrder;
    });

    // Step 6: Deduct user balance
    const updatedUser = await step.run('update-user-balance', async () => {
      console.log(`[Step 6] Deducting ${financialCheck.totalAmount} from user balance`);
      const newBalance = user.balance - financialCheck.totalAmount;
      const updated = await dbHelpers.updateUser(userId, { balance: newBalance });
      console.log(`[Step 6] New user balance: ${updated?.balance}`);
      return updated;
    });

    // Step 7: Deduct inventory stock
    const updatedInventory = await step.run('update-inventory', async () => {
      console.log(`[Step 7] Deducting ${quantity} units from inventory`);
      const newStock = item.stock - quantity;
      const updated = await dbHelpers.updateInventory(itemId, { stock: newStock });
      console.log(`[Step 7] New inventory stock: ${updated?.stock}`);
      return updated;
    });

    // Step 8: Create transaction record
    const transaction = await step.run('create-transaction', async () => {
      console.log(`[Step 8] Creating transaction record`);
      const txnData = {
        orderId: order.id,
        userId,
        amount: financialCheck.totalAmount,
        type: 'purchase',
        status: 'completed'
      };
      const txn = await dbHelpers.createTransaction(txnData);
      console.log(`[Step 8] Transaction created:`, txn.id);
      return txn;
    });

    // Step 9: Update order status to completed
    const finalOrder = await step.run('finalize-order', async () => {
      console.log(`[Step 9] Finalizing order`);
      const updated = await dbHelpers.updateOrder(order.id, { 
        status: 'completed',
        transactionId: transaction.id,
        completedAt: new Date().toISOString()
      });
      console.log(`[Step 9] Order finalized:`, updated?.id);
      return updated;
    });

    // Step 10: Apply dummy bonus points (additional value change)
    const bonusPoints = await step.run('apply-bonus-points', async () => {
      console.log(`[Step 10] Applying bonus points`);
      const points = Math.floor(financialCheck.totalAmount * 0.1); // 10% as points
      // Store in user object (dummy field)
      const currentPoints = user.bonusPoints || 0;
      await dbHelpers.updateUser(userId, { bonusPoints: currentPoints + points });
      console.log(`[Step 10] Added ${points} bonus points`);
      return { points, total: currentPoints + points };
    });

    return {
      success: true,
      order: finalOrder,
      transaction,
      userBalance: updatedUser?.balance,
      inventoryStock: updatedInventory?.stock,
      bonusPoints: bonusPoints.total,
      summary: {
        itemPurchased: item.name,
        quantity,
        totalPaid: financialCheck.totalAmount,
        pointsEarned: bonusPoints.points
      }
    };
  }
);

// Mount Inngest serve handler at /api/inngest
app.on(['GET', 'POST', 'PUT'], '/api/inngest', serveInngest({
  client: inngest,
  functions: [
    helloFunction,
    processOrderFunction,
    complexWorkflowFunction
  ]
}));

// Regular Hono routes
app.get('/', (c) => {
  return c.json({ 
    message: 'Hono + Inngest API with Multi-Step Workflows',
    endpoints: {
      inngest: '/api/inngest',
      triggerHello: '/trigger/hello',
      triggerOrder: '/trigger/order',
      triggerWorkflow: '/trigger/workflow',
      viewDatabase: '/db/view'
    }
  });
});

// Endpoint to trigger Inngest events
app.post('/trigger/hello', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  await inngest.send({
    name: 'demo/hello.world',
    data: {
      name: body.name || 'Guest'
    }
  });

  return c.json({ message: 'Event sent to Inngest', event: 'demo/hello.world' });
});

app.post('/trigger/order', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  await inngest.send({
    name: 'app/order.created',
    data: {
      orderId: body.orderId || `order_${Date.now()}`,
      amount: body.amount || 100,
      userId: body.userId || 'user_123'
    }
  });

  return c.json({ message: 'Order event sent to Inngest', event: 'app/order.created' });
});

// Endpoint to trigger complex workflow
app.post('/trigger/workflow', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  const userId = body.userId || 'user_1';
  const itemId = body.itemId || 'item_1';
  const quantity = body.quantity || 2;

  await inngest.send({
    name: 'app/workflow.start',
    data: {
      userId,
      itemId,
      quantity
    }
  });

  return c.json({ 
    message: 'Complex workflow started',
    event: 'app/workflow.start',
    data: { userId, itemId, quantity }
  });
});

// Endpoint to view current database state
app.get('/db/view', (c) => {
  return c.json({
    users: Array.from(db.users.values()),
    inventory: Array.from(db.inventory.values()),
    orders: Array.from(db.orders.values()),
    transactions: Array.from(db.transactions.values())
  });
});

const port = 3000;
console.log(`🔥 Server is running on http://localhost:${port}`);
console.log(`📨 Inngest endpoint: http://localhost:${port}/api/inngest`);

serve({
  fetch: app.fetch,
  port
});
