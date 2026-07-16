// ecommerce-store/src/api/products.js   

export const products = [
  {
    id: 1,
    name: 'سماعة لاسلكية Sony WH-1000XM5',
    price: 14999,
    description: 'سماعة رائعة مع خاصية إلغاء الضوضاء، تدعم LDAC وبلوتوث 5.2، عمر بطارية يصل إلى 30 ساعة',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/1/300/300',
    rating: 4.8,
    stock: 15,
    brand: 'Sony'
  },
  {
    id: 2,
    name: 'ساعة أبل الذكية Series 9',
    price: 21999,
    description: 'شاشة Retina دائمة الإضاءة، مستشعر نبض، GPS، مقاومة للماء، تدعم نظام watchOS 10',
    category: 'ساعات ذكية',
    image: 'https://picsum.photos/id/2/300/300',
    rating: 4.9,
    stock: 8,
    brand: 'Apple'
  },
  {
    id: 3,
    name: 'لابتوب MacBook Air M2',
    price: 45999,
    description: 'شاشة 13.6 بوصة، معالج M2، 8GB RAM، 256GB SSD، عمر بطارية يصل إلى 18 ساعة',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/3/300/300',
    rating: 4.7,
    stock: 12,
    brand: 'Apple'
  },
  {
    id: 4,
    name: 'هاتف Samsung Galaxy S24 Ultra',
    price: 38999,
    description: 'شاشة 6.8 بوصة، كاميرا 200 ميجابكسل، معالج Snapdragon 8 Gen 3، 12GB RAM',
    category: 'هواتف',
    image: 'https://picsum.photos/id/4/300/300',
    rating: 4.6,
    stock: 20,
    brand: 'Samsung'
  },
  {
    id: 5,
    name: 'تابلت iPad Pro 12.9',
    price: 32999,
    description: 'شاشة Liquid Retina XDR، معالج M2، يدعم Apple Pencil، مثالي للتصميم والإنتاجية',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/5/300/300',
    rating: 4.8,
    stock: 10,
    brand: 'Apple'
  },
  {
    id: 6,
    name: 'سماعة أذن لاسلكية AirPods Pro 2',
    price: 8999,
    description: 'خاصية إلغاء الضوضاء النشط، صوت محيطي، عمر بطارية 6 ساعات، مقاومة للعرق والماء',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/6/300/300',
    rating: 4.7,
    stock: 25,
    brand: 'Apple'
  },
  {
    id: 7,
    name: 'حذاء رياضي Nike Air Max 270',
    price: 4999,
    description: 'حذاء رياضي مريح مع وسادة هوائية، مناسب للجري والمشي اليومي، متوفر بمقاسات مختلفة',
    category: 'ملابس وأحذية',
    image: 'https://picsum.photos/id/7/300/300',
    rating: 4.5,
    stock: 30,
    brand: 'Nike'
  },
  {
    id: 8,
    name: 'ساعة رياضية Garmin Forerunner 255',
    price: 12999,
    description: 'GPS مدمج، مراقبة معدل ضربات القلب، مقاومة للماء، تدعم أكثر من 30 نشاط رياضي',
    category: 'ساعات ذكية',
    image: 'https://picsum.photos/id/8/300/300',
    rating: 4.4,
    stock: 7,
    brand: 'Garmin'
  },
  {
    id: 9,
    name: 'كاميرا رقمية Canon EOS R6',
    price: 69999,
    description: 'كاميرا بدون مرآة، مستشعر 20.1 ميجابكسل، تصوير فيديو 4K، مثالية للمحترفين',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/9/300/300',
    rating: 4.9,
    stock: 5,
    brand: 'Canon'
  },
  {
    id: 10,
    name: 'شاشة ألعاب LG UltraGear 27"',
    price: 15999,
    description: 'شاشة 27 بوصة، دقة 4K، معدل تحديث 144Hz، تدعم HDR10، مثالية للألعاب',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/10/300/300',
    rating: 4.6,
    stock: 9,
    brand: 'LG'
  },
  {
    id: 11,
    name: 'شنطة ظهر بتصميم عصري',
    price: 899,
    description: 'شنطة ظهر مقاومة للماء، تتسع للابتوب حتى 15 بوصة، تصميم عصري ومريح للظهر',
    category: 'إكسسوارات',
    image: 'https://picsum.photos/id/11/300/300',
    rating: 4.3,
    stock: 40,
    brand: 'Generic'
  },
  {
    id: 12,
    name: 'ماوس لاسلكي Logitech MX Master 3S',
    price: 3999,
    description: 'ماوس احترافي مع حساس 8K DPI، يدعم الشحن السريع، اتصال بلوتوث وحتى 3 أجهزة',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/12/300/300',
    rating: 4.8,
    stock: 18,
    brand: 'Logitech'
  },
  {
    id: 13,
    name: 'ساعة يد رجالية كاجوال',
    price: 2499,
    description: 'ساعة يد بتصميم كلاسيكي، معدن مقاوم للصدأ، حركة أوتوماتيكية، مثالية للمناسبات الرسمية',
    category: 'إكسسوارات',
    image: 'https://picsum.photos/id/13/300/300',
    rating: 4.2,
    stock: 22,
    brand: 'Fossil'
  },
  {
    id: 14,
    name: 'قلم ذكي Samsung S Pen',
    price: 799,
    description: 'قلم رقمي مناسب لسلسلة Samsung Galaxy، حساسية 4096 درجة، بطارية تدوم طويلاً',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/14/300/300',
    rating: 4.4,
    stock: 35,
    brand: 'Samsung'
  },
  {
    id: 15,
    name: 'تيشيرت قطني رياضي',
    price: 499,
    description: 'تيشيرت قطن 100%، خفيف الوزن، مناسب للرياضة والاستخدام اليومي، متوفر بألوان متعددة',
    category: 'ملابس وأحذية',
    image: 'https://picsum.photos/id/15/300/300',
    rating: 4.1,
    stock: 50,
    brand: 'Adidas'
  },
  {
    id: 16,
    name: 'روبوت تنظيف أرضيات',
    price: 18999,
    description: 'روبوت ذكي لتنظيف الأرضيات، يدعم خاصية الشحن الذاتي، خريطة منزلية، يصلح للسجاد والبلاط',
    category: 'أجهزة منزلية',
    image: 'https://picsum.photos/id/16/300/300',
    rating: 4.7,
    stock: 6,
    brand: 'Xiaomi'
  },
  {
    id: 17,
    name: 'نظارة VR واقع افتراضي',
    price: 24999,
    description: 'نظارة واقع افتراضي، دقة 4K، تدعم الألعاب والتطبيقات التفاعلية، خفيفة الوزن',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/17/300/300',
    rating: 4.5,
    stock: 4,
    brand: 'Oculus'
  },
  {
    id: 18,
    name: 'مكبر صوت محمول JBL Charge 5',
    price: 2999,
    description: 'مكبر صوت مقاوم للماء، بطارية تدوم 20 ساعة، صوت عالي الجودة، يدعم Bluetooth 5.1',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/18/300/300',
    rating: 4.6,
    stock: 14,
    brand: 'JBL'
  },
  {
    id: 19,
    name: 'حقيبة كروس شبابية',
    price: 599,
    description: 'حقيبة كروس صغيرة، جلد صناعي، مقاس مناسب للهاتف والمحفظة، تصميم عصري',
    category: 'إكسسوارات',
    image: 'https://picsum.photos/id/19/300/300',
    rating: 4.0,
    stock: 28,
    brand: 'Generic'
  },
  {
    id: 20,
    name: 'شاحن لاسلكي سريع',
    price: 1299,
    description: 'شاحن لاسلكي بقوة 15 وات، يدعم أجهزة Apple وSamsung وسوني، مزود بمصباح LED',
    category: 'إلكترونيات',
    image: 'https://picsum.photos/id/20/300/300',
    rating: 4.3,
    stock: 32,
    brand: 'Anker'
  }
];

// دوال مساعدة للتعامل مع المنتجات
export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id) => {
  return products.find(product => product.id === id);
};

export const getCategories = () => {
  const categories = products.map(product => product.category);
  return [...new Set(categories)]; // إزالة التكرار
};

export const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.brand.toLowerCase().includes(lowerQuery)
  );
};