import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient } from '../config/supabase.config';
import { SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  paid_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  order_id?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  email_sent: boolean;
  created_at: string;
}

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createSupabaseClient(configService);
  }

  // User methods
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.error(`Error fetching user ${userId}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  async createUser(email: string, name: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({ email, name })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating user:', error);
        return null;
      }

      this.logger.log(`User created: ${email}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      return null;
    }
  }

  // Order methods
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        this.logger.error(`Error fetching order ${orderId}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  }

  async createOrder(userId: string, orderNumber: string, totalAmount: number): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating order:', error);
        return null;
      }

      this.logger.log(`Order created: ${orderNumber}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      return null;
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['payment_status']): Promise<Order | null> {
    try {
      const updateData: any = { status };
      
      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
        if (paymentStatus === 'paid') {
          updateData.paid_at = new Date().toISOString();
        }
      }

      const { data, error } = await this.supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating order ${orderId}:`, error);
        return null;
      }

      this.logger.log(`Order ${orderId} updated to status: ${status}`);
      return data;
    } catch (error) {
      this.logger.error(`Error updating order ${orderId}:`, error);
      return null;
    }
  }

  // Notification methods
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating notification:', error);
        return null;
      }

      this.logger.log(`Notification created for user ${notification.user_id}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      return null;
    }
  }

  async markNotificationEmailSent(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ email_sent: true })
        .eq('id', notificationId);

      if (error) {
        this.logger.error(`Error marking notification ${notificationId} as email sent:`, error);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error marking notification ${notificationId} as email sent:`, error);
      return false;
    }
  }
}