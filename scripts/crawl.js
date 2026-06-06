import { initDb, run, get } from '../src/lib/db.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

// Generate UUID helper
const uuid = () => crypto.randomUUID();

// Slugify helper
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const CATEGORIES = [
  {
    name: 'Gốm Sứ Thủ Công',
    slug: 'gom-su-thu-cong',
    description: 'Các sản phẩm gốm sứ nghệ thuật làm thủ công bằng tay, nung nhiệt độ cao.'
  },
  {
    name: 'Đồ Da Cao Cấp',
    slug: 'do-da-cao-cap',
    description: 'Bóp ví, túi xách, thắt lưng da thật khâu tay tỉ mỉ từng đường kim mũi chỉ.'
  },
  {
    name: 'Nến Thơm Nghệ Thuật',
    slug: 'nen-thom-nghe-thuat',
    description: 'Nến thơm sáp đậu nành tự nhiên, tinh dầu nhập khẩu cao cấp, an toàn sức khỏe.'
  },
  {
    name: 'Trang Sức & Phụ Kiện',
    slug: 'trang-suc-phu-kien',
    description: 'Vòng tay, dây chuyền, khuyên tai làm thủ công từ bạc, đá tự nhiên và hạt.'
  },
  {
    name: 'Trang Trí Nhà Cửa Macrame',
    slug: 'trang-tri-macrame',
    description: 'Tranh treo tường macrame, thảm, rèm thắt nút phong cách boho hiện đại.'
  }
];

const PRODUCTS_DATA = {
  'gom-su-thu-cong': [
    {
      name: 'Bình Hoa Gốm Men Hỏa Biến',
      description: 'Bình hoa được làm thủ công bằng bàn xoay, tráng men hỏa biến độc bản. Mỗi chiếc bình có hoa văn và vệt màu độc nhất vô nhị do sự thay đổi nhiệt độ trong lò nung.',
      price: 450000,
      stock: 5,
      attributes: { material: 'Đất sét trắng, men hỏa biến', dimensions: 'Cao 22cm, Đường kính 12cm', weight: '800g', origin: 'Bát Tràng, Việt Nam' },
      images: [
        { url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', is_primary: 0 }
      ]
    },
    {
      name: 'Bộ Ly Tách Gốm Trà Chiều',
      description: 'Bộ sản phẩm gồm 1 ấm trà và 4 ly tách gốm tráng men mờ mộc mạc. Thích hợp cho không gian thưởng trà thư giãn tĩnh lặng.',
      price: 680000,
      stock: 3,
      attributes: { material: 'Gốm thô tráng men mờ', capacity: 'Ấm 450ml, Tách 80ml', packaging: 'Hộp quà tặng carton lót rơm', origin: 'Làng gốm Phù Lãng' },
      images: [
        { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', is_primary: 0 }
      ]
    }
  ],
  'do-da-cao-cap': [
    {
      name: 'Ví Nam Da Bò Sáp Khâu Tay',
      description: 'Ví dáng đứng cổ điển làm từ da bò sáp nhập khẩu. Khâu tay hoàn toàn bằng chỉ sáp cao cấp, các cạnh da được đánh bóng sáp ong bền đẹp theo thời gian.',
      price: 550000,
      stock: 10,
      attributes: { material: 'Da bò sáp thật 100%', pockets: '6 ngăn thẻ, 2 ngăn tiền giấy', dimensions: '11cm x 9cm', color: 'Nâu Coffee' },
      images: [
        { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', is_primary: 1 }
      ]
    },
    {
      name: 'Túi Tote Da Đeo Vai Unisex',
      description: 'Túi tote da bò Mill mềm mại, khoang chứa rộng rãi đựng vừa laptop 13-14 inch và tài liệu A4. Quai đeo chịu lực tốt phù hợp đi học, đi làm.',
      price: 1850000,
      stock: 2,
      attributes: { material: 'Da bò Mill mềm hạt', dimensions: '35cm x 30cm x 8cm', strap_drop: '28cm', closure: 'Khóa kéo YKK đồng thau' },
      images: [
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', is_primary: 1 }
      ]
    }
  ],
  'nen-thom-nghe-thuat': [
    {
      name: 'Nến Thơm Sáp Đậu Nành Gỗ Đàn Hương',
      description: 'Nến thơm thuần chay từ sáp đậu nành thiên nhiên hòa quyện tinh dầu gỗ đàn hương trầm ấm và hổ phách dịu ngọt. Giúp giải tỏa căng thẳng sau ngày làm việc mệt mỏi.',
      price: 280000,
      stock: 20,
      attributes: { material: 'Sáp đậu nành, bấc gỗ, tinh dầu thiên nhiên', burn_time: '45-50 giờ', weight: '200g (Hũ thủy tinh)', scent_notes: 'Gỗ đàn hương, tuyết tùng, hổ phách' },
      images: [
        { url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?auto=format&fit=crop&w=800&q=80', is_primary: 0 }
      ]
    },
    {
      name: 'Nến Thơm Mùi Quế Ấm Áp',
      description: 'Mang hương vị giáng sinh ấm áp vào phòng ngủ của bạn với hương quế kết hợp cùng vỏ cam sấy khô tự nhiên trang trí trên bề mặt nến.',
      price: 250000,
      stock: 12,
      attributes: { material: 'Sáp cọ và sáp ong, bấc cotton', burn_time: '35-40 giờ', weight: '150g (Hũ thiếc vintage)', scent_notes: 'Vỏ quế, cam ngọt, đinh hương' },
      images: [
        { url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80', is_primary: 1 }
      ]
    }
  ],
  'trang-suc-phu-kien': [
    {
      name: 'Vòng Tay Bạc Khắc Hoa Văn Cổ',
      description: 'Chiếc vòng tay bạc S925 được người thợ chạm bạc lành nghề rèn thủ công với hoa văn cổ điển sang trọng và tinh tế.',
      price: 750000,
      stock: 4,
      attributes: { material: 'Bạc S925 nguyên chất', size: 'Freesize (có thể điều chỉnh)', width: '6mm', finish: 'Bạc cổ mờ' },
      images: [
        { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', is_primary: 0 }
      ]
    },
    {
      name: 'Khuyên Tai Hạt Đá Thạch Anh Hồng',
      description: 'Khuyên tai dáng dài nhẹ nhàng làm từ đá thạch anh hồng thô kết hợp dây đồng mảnh nghệ thuật, mang lại năng lượng tình yêu dịu mát.',
      price: 180000,
      stock: 8,
      attributes: { material: 'Đá thạch anh hồng tự nhiên, móc bạc S925', length: '4cm', theme: 'Nữ tính, tự nhiên' },
      images: [
        { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', is_primary: 1 }
      ]
    }
  ],
  'trang-tri-macrame': [
    {
      name: 'Tranh Treo Tường Macrame Mandala',
      description: 'Tranh treo tường cỡ lớn thắt nút nghệ thuật dạng Mandala tròn tinh xảo, tạo điểm nhấn đậm chất Bắc Âu (Scandinavian) hoặc Boho Chic cho phòng khách.',
      price: 890000,
      stock: 3,
      attributes: { material: 'Sợi cotton xoắn 4mm, thanh treo gỗ thông tự nhiên', dimensions: 'Rộng 60cm x Dài 85cm', care: 'Giũ bụi nhẹ nhàng, không giặt máy' },
      images: [
        { url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80', is_primary: 1 }
      ]
    }
  ]
};

async function main() {
  console.log('--- KHỞI TẠO CƠ SỞ DỮ LIỆU ---');
  await initDb();
  console.log('Đã tạo các bảng cơ sở dữ liệu thành công.');

  console.log('\n--- BẮT ĐẦU CRAWL & GIẢ LẬP DỮ LIỆU SẢN PHẨM ---');

  for (const cat of CATEGORIES) {
    // Check if category already exists
    let existingCat = await get('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    let categoryId;
    if (existingCat) {
      categoryId = existingCat.id;
      console.log(`Danh mục [${cat.name}] đã tồn tại.`);
    } else {
      categoryId = uuid();
      await run(
        'INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)',
        [categoryId, cat.name, cat.slug, cat.description]
      );
      console.log(`Đã tạo danh mục mới: [${cat.name}]`);
    }

    const products = PRODUCTS_DATA[cat.slug] || [];
    for (const prod of products) {
      let existingProd = await get('SELECT id FROM products WHERE slug = ?', [slugify(prod.name)]);
      if (existingProd) {
        console.log(`Sản phẩm [${prod.name}] đã tồn tại.`);
        continue;
      }

      const productId = uuid();
      const slug = slugify(prod.name);

      await run(
        'INSERT INTO products (id, category_id, name, slug, description, price, stock, status, attributes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          productId,
          categoryId,
          prod.name,
          slug,
          prod.description,
          prod.price,
          prod.stock,
          'active',
          JSON.stringify(prod.attributes)
        ]
      );
      console.log(`  - Đã thêm sản phẩm: ${prod.name}`);

      for (const img of prod.images) {
        await run(
          'INSERT INTO product_images (id, product_id, url, is_primary) VALUES (?, ?, ?, ?)',
          [uuid(), productId, img.url, img.is_primary]
        );
      }
    }
  }

  console.log('\n--- HOÀN THÀNH QUÁ TRÌNH KHỞI TẠO DỮ LIỆU ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Lỗi khi chạy crawler:', err);
  process.exit(1);
});
