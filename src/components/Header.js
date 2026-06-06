'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function Header() {
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for client state
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted
    ? cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#EAE6DF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="group">
              <span className="font-serif text-2xl font-bold tracking-widest text-[#1A1918] group-hover:text-[#D4A373] transition duration-300">
                AURACRAFT
              </span>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-[#8C867E]">
                Artisanal Handcrafted
              </span>
            </Link>
          </div>

          {/* Center navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link href="/" className="text-sm font-medium text-[#5C5752] hover:text-[#1A1918] transition duration-300">
              Sản Phẩm
            </Link>
            <Link href="/?category=gom-su-thu-cong" className="text-sm font-medium text-[#5C5752] hover:text-[#1A1918] transition duration-300">
              Gốm Sứ
            </Link>
            <Link href="/?category=do-da-cao-cap" className="text-sm font-medium text-[#5C5752] hover:text-[#1A1918] transition duration-300">
              Đồ Da
            </Link>
            <Link href="/?category=nen-thom-nghe-thuat" className="text-sm font-medium text-[#5C5752] hover:text-[#1A1918] transition duration-300">
              Nến Thơm
            </Link>
          </nav>

          {/* Cart Icon & Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative p-2.5 text-[#2C2A29] hover:text-[#D4A373] transition-colors rounded-full hover:bg-[#F2EFE9]"
              aria-label="Shopping Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C2410C] text-[10px] font-bold text-white ring-2 ring-[#FAF9F6]">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
