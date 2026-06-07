import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Silently accept error reports from SDK tracking telemetry
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    return new NextResponse('Error', { status: 500 });
  }
}
