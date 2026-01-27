import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private supabaseService: SupabaseService) {}

  async processOrderPayment(orderId: string): Promise<boolean> {
    try {
      this.logger.log(`Processing payment for order: ${orderId}`);

      // Get order details
      const order = await this.supabaseService.getOrderById(orderId);
      if (!order) {
        this.logger.error(`Order not found: ${orderId}`);
        return false;
      }

      // Get user details
      const user = await this.supabaseService.getUserById(order.user_id);
      if (!user) {
        this.logger.error(`User not found for order: ${orderId}`);
        return false;
      }

      // Update order status to paid
      const updatedOrder = await this.supabaseService.updateOrderStatus(
        orderId,
        'paid',
        'paid'
      );

      if (!updatedOrder) {
        this.logger.error(`Failed to update order status: ${orderId}`);
        return false;
      }

      // Create notification
      const notification = await this.supabaseService.createNotification({
        user_id: user.id,
        order_id: orderId,
        type: 'payment_success',
        title: 'Order Payment Confirmed',
        message: `Your payment for order #${order.order_number} has been confirmed. Your order is now being processed.`,
        read: false,
        email_sent: false,
      });

      if (!notification) {
        this.logger.error(`Failed to create notification for order: ${orderId}`);
        return false;
      }

      this.logger.log(`Order payment processed successfully: ${orderId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error processing order payment ${orderId}:`, error);
      return false;
    }
  }
}