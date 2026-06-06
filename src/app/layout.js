import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Link from "next/link";
import Header from "@/components/Header";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata = {
  title: "AuraCraft | Đồ Thủ Công Mỹ Nghệ Tinh Sảo",
  description: "Khám phá thế giới đồ gốm, đồ da và nến thơm chế tác thủ công cao cấp độc bản tại AuraCraft.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${plusJakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#2C2A29] font-sans selection:bg-[#D4A373] selection:text-white">
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <footer className="bg-[#1A1918] text-[#E5E1DA] py-12 border-t border-[#3A3836]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-[#D4A373] block mb-4">AURACRAFT</span>
                <p className="text-sm text-[#A8A29E] leading-relaxed">
                  Nơi hội tụ các tác phẩm nghệ thuật thủ công tinh sảo độc bản, được kiến tạo bởi đôi tay tài hoa của người nghệ nhân Việt.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4 text-[#D4A373]">Danh Mục</h3>
                <ul className="space-y-2 text-sm text-[#A8A29E]">
                  <li><Link href="/?category=gom-su-thu-cong" className="hover:text-white transition">Gốm Sứ</Link></li>
                  <li><Link href="/?category=do-da-cao-cap" className="hover:text-white transition">Đồ Da Thủ Công</Link></li>
                  <li><Link href="/?category=nen-thom-nghe-thuat" className="hover:text-white transition">Nến Thơm</Link></li>
                  <li><Link href="/?category=trang-suc-phu-kien" className="hover:text-white transition">Trang Sức</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4 text-[#D4A373]">Hỗ Trợ</h3>
                <ul className="space-y-2 text-sm text-[#A8A29E]">
                  <li><a href="#" className="hover:text-white transition">Chính sách vận chuyển</a></li>
                  <li><a href="#" className="hover:text-white transition">Chính sách đổi trả</a></li>
                  <li><a href="#" className="hover:text-white transition">Hướng dẫn bảo quản</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4 text-[#D4A373]">Liên Hệ</h3>
                <p className="text-sm text-[#A8A29E] mb-2">Showroom: 123 Lê Lợi, Bến Nghé, Quận 1, TP. HCM</p>
                <p className="text-sm text-[#A8A29E] mb-2">Hotline: 1900 8888</p>
                <p className="text-sm text-[#A8A29E]">Email: contact@auracraft.vn</p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-[#3A3836] text-center text-xs text-[#78716C]">
              &copy; {new Date().getFullYear()} AuraCraft. Đã đăng ký bản quyền. Thiết kế và phát triển bởi Antigravity.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
