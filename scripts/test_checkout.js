import axios from 'axios';

async function test() {
  try {
    console.log('1. Fetching products to get a valid ID...');
    const prodRes = await axios.get('https://handmade-store-mu.vercel.app/api/products');
    const product = prodRes.data.products[0];
    console.log(`Found product: ${product.name} (ID: ${product.id}, Price: ${product.price})`);

    const payload = {
      payment_method: 'cod',
      shipping_address: {
        recipient_name: 'Nguyen Van Vercel',
        phone: '0999888777',
        address_line: 'Vercel Serverless Street',
        city: 'Ho Chi Minh',
        country: 'Vietnam'
      },
      items: [
        {
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ]
    };

    console.log('2. Sending POST request to /api/orders...');
    const orderRes = await axios.post('https://handmade-store-mu.vercel.app/api/orders', payload, {
      headers: {
        'x-cart-id': 'local-cart-session'
      }
    });

    console.log('Success!', orderRes.data);
  } catch (error) {
    if (error.response) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Connection Error:', error.message);
    }
  }
}

test();
