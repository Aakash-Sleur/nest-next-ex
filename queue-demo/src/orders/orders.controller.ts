import { Controller, Post, Param, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { inngest } from '../inngest/inngest.client';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private ordersService: OrdersService) {}

  @Post(':orderId/process-payment')
  async processOrderPayment(
    @Param('orderId') orderId: string,
    @Body() body?: { webhook_data?: any }
  ) {
    try {
      this.logger.log(`Received payment processing request for order: ${orderId}`);

      if (!orderId) {
        throw new HttpException('Order ID is required', HttpStatus.BAD_REQUEST);
      }

      // Trigger the Inngest background job
      await inngest.send({
        name: 'order.payment.received',
        data: {
          orderId,
          webhookData: body?.webhook_data || {},
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(`Background job triggered for order: ${orderId}`);

      return {
        success: true,
        message: 'Order payment processing initiated',
        orderId,
      };
    } catch (error) {
      this.logger.error(`Error processing payment for order ${orderId}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':orderId/test-process')
  async testProcessOrder(@Param('orderId') orderId: string) {
    try {
      this.logger.log(`Test processing order: ${orderId}`);

      const result = await this.ordersService.processOrderPayment(orderId);

      if (!result) {
        throw new HttpException(
          'Failed to process order',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return {
        success: true,
        message: 'Order processed successfully',
        orderId,
      };
    } catch (error) {
      this.logger.error(`Error in test processing order ${orderId}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}