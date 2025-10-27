// Quick test script to check buyer products endpoint
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/v1';

async function testBuyerProducts() {
  console.log('🔍 Testing Buyer Products Endpoint...\n');

  // First, let's check if there are products in the admin endpoint (no auth needed for testing)
  try {
    console.log('1️⃣ Checking admin products endpoint...');
    const adminResponse = await fetch(`${API_BASE}/admin/products`);
    const adminData = await adminResponse.json();
    console.log(`   ✅ Admin products: ${adminData.products?.length || 0} products found`);
    if (adminData.products?.length > 0) {
      console.log(`   📦 Sample product: ${adminData.products[0].name}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Now test buyer login
  try {
    console.log('\n2️⃣ Testing buyer login...');
    const loginResponse = await fetch(`${API_BASE}/auth/buyer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'buyer@test.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success && loginData.token) {
      console.log('   ✅ Login successful');
      const token = loginData.token;

      // Test buyer products endpoint with auth
      console.log('\n3️⃣ Testing buyer products endpoint with authentication...');
      const buyerResponse = await fetch(`${API_BASE}/buyer/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const buyerData = await buyerResponse.json();
      
      if (buyerResponse.ok) {
        console.log(`   ✅ Buyer products: ${buyerData.products?.length || 0} products found`);
        if (buyerData.products?.length > 0) {
          console.log(`   📦 Sample product: ${buyerData.products[0].name}`);
        } else {
          console.log('   ⚠️  No products returned - database might be empty');
        }
      } else {
        console.log(`   ❌ Error: ${buyerData.error || buyerData.message}`);
      }
    } else {
      console.log(`   ❌ Login failed: ${loginData.error || loginData.message}`);
      console.log('   💡 You may need to register a buyer account first');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n✨ Test complete!');
}

testBuyerProducts();