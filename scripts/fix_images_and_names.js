import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.json');
const CSV_PATH = path.join(process.cwd(), 'products.csv');

if (!fs.existsSync(DB_PATH)) {
  console.error('database.json not found!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

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

// Define mapping of adjustments (Target by old name/slug)
const updates = [
  // Nến thơm nghệ thuật
  {
    oldName: 'Nến Thơm Hoa Hồng Ngọt Ngào',
    newName: 'Nến Thơm Hoa Hồng Ngọt Ngào',
    imageUrl: 'https://images.unsplash.com/photo-1602872030267-33f7c4613c75?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Nến Thơm Trà Xanh Thanh Mát',
    newName: 'Nến Thơm Trà Xanh Thanh Mát',
    imageUrl: 'https://images.unsplash.com/photo-1602872029708-84fcb208b030?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Xà Phòng Than Tre Trị Mụn',
    newName: 'Xà Phòng Than Tre Trị Mụn',
    imageUrl: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=800&q=80'
  },
  
  // Trang sức & phụ kiện
  {
    oldName: 'Nhẫn Bạc Chỉ Đơn Giản May Mắn',
    newName: 'Nhẫn Bạc S925 Trơn Tối Giản',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Lắc Chân Hạt Đậu Bạc Dễ Thương',
    newName: 'Lắc Chân Bạc S925 Hạt Đậu Ý',
    imageUrl: 'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Vòng Cổ Choker Hạt Cườm Biển',
    newName: 'Vòng Cổ Choker Hạt Cườm & Vỏ Sò Biển',
    imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Khuyên Tai Tròn Bạc Phay Xước',
    newName: 'Khuyên Tai Tròn Bạc Phay Xước',
    imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Vòng Tay Chỉ Đỏ Kim Cương Nhân Tạo',
    newName: 'Vòng Chỉ Đỏ May Mắn Đính Đá CZ',
    imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Trâm Cài Tóc Gỗ Đào Khắc Sen',
    newName: 'Trâm Cài Tóc Gỗ Đào Khắc Sen',
    imageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Nhẫn Bạc Đính Đá Lapis Xanh Dương',
    newName: 'Nhẫn Bạc S925 Đính Đá Lapis Lazuli',
    imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Vòng Dây Da Unisex Đính Charm Đồng',
    newName: 'Vòng Đeo Cổ Dây Da Charm Mỏ Neo Đồng',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
  },

  // Trang trí Macrame
  {
    oldName: 'Giá Treo Cây Macrame Đơn',
    newName: 'Giỏ Treo Chậu Cây Macrame Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1581580173663-e38058957805?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Thảm Treo Đầu Giường Macrame Lá',
    newName: 'Mành Treo Tường Macrame Hình Lá Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Đế Lót Ly Macrame Tua Rua',
    newName: 'Đế Lót Ly Macrame Tua Rua Tối Giản',
    imageUrl: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Kệ Gỗ Treo Tường Dây Thắt',
    newName: 'Kệ Gỗ Treo Tường Macrame Dây Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Võng Treo Mèo Macrame Thư Giãn',
    newName: 'Võng Treo Mèo Macrame Vintage',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Đèn Ngủ Thả Trần Macrame',
    newName: 'Chao Đèn Thả Trần Macrame Phong Cách Boho',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Gương Decor Tròn Viền Macrame',
    newName: 'Gương Treo Tường Viền Macrame Tua Rua',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Túi Xách Nữ Macrame Đi Biển',
    newName: 'Túi Cầm Tay Macrame Đi Biển Vintage',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldName: 'Rèm Cửa Sổ Ngăn Phòng Macrame',
    newName: 'Rèm Treo Cửa Macrame Vintage Cỡ Lớn',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  }
];

updates.forEach(u => {
  const product = data.products.find(p => p.name === u.oldName);
  if (product) {
    console.log(`Updating product: "${product.name}" -> "${u.newName}"`);
    product.name = u.newName;
    product.slug = slugify(u.newName);
    product.updated_at = new Date().toISOString();

    // Update primary image url
    const img = data.product_images.find(i => i.product_id === product.id && i.is_primary === 1);
    if (img) {
      console.log(`  Updating image URL for "${u.newName}"`);
      img.url = u.imageUrl;
    }
  } else {
    console.warn(`Product not found for: "${u.oldName}"`);
  }
});

// Save database.json
fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
console.log('Saved changes to database.json');

// Regenerate products.csv
const headers = ['ID', 'Category ID', 'Name', 'Slug', 'Price', 'Stock', 'Status', 'Attributes', 'Image URL'];
const csvRows = [headers.join(',')];

data.products.forEach(p => {
  const primaryImg = data.product_images.find(img => img.product_id === p.id && img.is_primary === 1)?.url || '';
  
  const escapeField = (val) => {
    if (val === null || val === undefined) return '""';
    const str = val.toString().replace(/"/g, '""');
    return `"${str}"`;
  };

  const row = [
    escapeField(p.id),
    escapeField(p.category_id),
    escapeField(p.name),
    escapeField(p.slug),
    p.price,
    p.stock,
    escapeField(p.status),
    escapeField(p.attributes),
    escapeField(primaryImg)
  ];

  csvRows.push(row.join(','));
});

try {
  fs.writeFileSync(CSV_PATH, '\ufeff' + csvRows.join('\n'), 'utf-8');
  console.log('Regenerated products.csv successfully');
} catch (err) {
  console.warn('Warning: Could not write products.csv (it might be open in Excel or another program):', err.message);
}
