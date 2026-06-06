import { NextResponse } from 'next/server';
import { getOrderDetails } from '@/services/orderService.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await getOrderDetails(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
