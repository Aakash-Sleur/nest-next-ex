import { inngest } from "./inngest.client";

export const functions = [
  // Order payment processing function
  inngest.createFunction(
    { id: "order-payment-processing" },
    { event: "order.payment.received" },

    async ({ event, step }) => {
      const { orderId, webhookData, timestamp } = event.data;

      console.log(`Starting payment processing for order: ${orderId}`);

      // Step 1: Validate the order exists and is in correct state
      const order = await step.run("validate-order", async () => {
        console.log(`Validating order: ${orderId}`);
        
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`, {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }

        const orders = await response.json();
        if (!orders || orders.length === 0) {
          throw new Error(`Order not found: ${orderId}`);
        }

        const orderData = orders[0];
        if (orderData.payment_status === 'paid') {
          throw new Error(`Order ${orderId} is already paid`);
        }

        console.log(`Order ${orderId} validated successfully`);
        return orderData;
      });

      // Step 2: Update order status to paid
      const updatedOrder = await step.run("update-order-status", async () => {
        console.log(`Updating order status to paid: ${orderId}`);
        
        const updateData = {
          status: 'paid',
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        };

        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
          method: 'PATCH',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update order: ${response.statusText}`);
        }

        const updatedOrders = await response.json();
        if (!updatedOrders || updatedOrders.length === 0) {
          throw new Error(`Failed to update order status: ${orderId}`);
        }

        console.log(`Order ${orderId} marked as paid`);
        return updatedOrders[0];
      });

      // Step 3: Get user information
      const user = await step.run("get-user-info", async () => {
        console.log(`Getting user info for order: ${orderId}`);
        
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${order.user_id}&select=*`, {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        const users = await response.json();
        if (!users || users.length === 0) {
          throw new Error(`User not found for order: ${orderId}`);
        }

        const userData = users[0];
        console.log(`User info retrieved for: ${userData.email}`);
        return userData;
      });

      // Step 4: Create notification
      const notification = await step.run("create-notification", async () => {
        console.log(`Creating notification for order: ${orderId}`);
        
        const notificationData = {
          user_id: user.id,
          order_id: orderId,
          type: 'payment_success',
          title: 'Order Payment Confirmed',
          message: `Your payment for order #${order.order_number} has been confirmed. Your order is now being processed.`,
          read: false,
          email_sent: false,
        };

        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/notifications`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(notificationData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create notification: ${response.statusText}`);
        }

        const notifications = await response.json();
        if (!notifications || notifications.length === 0) {
          throw new Error(`Failed to create notification for order: ${orderId}`);
        }

        console.log(`Notification created for order: ${orderId}`);
        return notifications[0];
      });

      // Step 5: Send email notification
      await step.run("send-email-notification", async () => {
        console.log(`Sending email notification for order: ${orderId}`);
        
        try {
          const subject = `Order Confirmation - #${order.order_number}`;
          
          const emailContent = `
Dear ${user.name},

Thank you for your order! We're pleased to confirm that your payment has been received and your order is now being processed.

Order Details:
- Order Number: #${order.order_number}
- Order Total: $${order.total_amount}
- Payment Status: Paid
- Order Date: ${new Date(order.created_at).toLocaleDateString()}

What's Next?
Your order is now being processed by our team. You'll receive another email with tracking information once your order has been shipped.

Need Help?
If you have any questions about your order, please contact us:
- Email: support@yourcompany.com
- Phone: +1 (555) 123-4567

Thank you for choosing us!
          `;

          console.log(`Email would be sent to: ${user.email}`);
          console.log(`Subject: ${subject}`);
          console.log(`Content: ${emailContent}`);
          
          // Mark notification as email sent
          const updateResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/notifications?id=eq.${notification.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_sent: true }),
          });

          if (!updateResponse.ok) {
            console.error(`Failed to mark notification as email sent: ${updateResponse.statusText}`);
          }
          
          console.log(`Email notification processed for order: ${orderId}`);
        } catch (error) {
          console.error(`Error sending email for order ${orderId}:`, error);
          // Don't throw here - we don't want to fail the entire process if email fails
        }
      });

      console.log(`Order payment processing completed successfully: ${orderId}`);
      
      return {
        success: true,
        orderId,
        orderNumber: order.order_number,
        userEmail: user.email,
        processedAt: timestamp,
      };
    }
  ),
];
