import { NextResponse } from 'next/server';
import { getProducts } from '@/services/productService.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category_id = searchParams.get('category_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const data = await getProducts({ page, limit, category_id, search, sort });

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
