import { NextResponse } from 'next/server';
import { run, get } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải từ 6 ký tự trở lên' },
        { status: 400 }
      );
    }

    // Check email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được đăng ký' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const userId = crypto.randomUUID();

    // Insert user
    await run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email.toLowerCase(), hashedPassword, 'user']
    );

    return NextResponse.json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: {
        id: userId,
        name,
        email: email.toLowerCase(),
        role: 'user'
      }
    });
  } catch (err) {
    console.error('Registration API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
