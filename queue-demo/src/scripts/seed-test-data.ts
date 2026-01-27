import { createClient } from '@supabase/supabase-js';

// Test data seeding script
const supabaseUrl = 'https://ozzulvxlpleczwbhwtae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96enVsdnhscGxlY3p3Ymh3dGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzAwMjEsImV4cCI6MjA4NDI0NjAyMX0.WldedQ3MFIM6nL3Ly5gQd4W715G08D5ztv9XHu4DXS4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTestData() {
  try {
    console.log('Seeding test data...');

    // Create a test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        name: 'Test User',
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log('Test user created:', user);

    // Create a test order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: `ORD-${Date.now()}`,
        status: 'pending',
        total_amount: 99.99,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return;
    }

    console.log('Test order created:', order);
    console.log('\n=== Test Data Created Successfully ===');
    console.log(`User ID: ${user.id}`);
    console.log(`User Email: ${user.email}`);
    console.log(`Order ID: ${order.id}`);
    console.log(`Order Number: ${order.order_number}`);
    console.log('\n=== Test the API ===');
    console.log(`POST http://localhost:3001/orders/${order.id}/process-payment`);
    console.log('or');
    console.log(`POST http://localhost:3001/orders/${order.id}/test-process`);

  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

// Run the seeding function
seedTestData();