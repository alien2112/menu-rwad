import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';

// Static categories data
const staticCategories = [
  {
    name: "العروض",
    nameEn: "Offers",
    description: "Special offers and promotions",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/24894209132cff55cd4cfb4dabe8b570960c19bc?width=68",
    color: "#FF6B6B",
    order: 1,
    status: "active" as const
  },
  {
    name: "الشاي",
    nameEn: "Tea",
    description: "Traditional and specialty teas",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/f342ec3b49d01d7e9eb71093eec45dae50e1c06b?width=72",
    color: "#4ECDC4",
    order: 2,
    status: "active" as const
  },
  {
    name: "قهوة بارده",
    nameEn: "Cold Coffee",
    description: "Refreshing cold coffee beverages",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/32aef080205f82b8f4b103c0cd979308b95d2d19?width=68",
    color: "#45B7D1",
    order: 3,
    status: "active" as const
  },
  {
    name: "قهوه ساخنة",
    nameEn: "Hot Coffee",
    description: "Warm and aromatic coffee drinks",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/6e4972442f216b34607ffaa20412dd755012a4d2?width=60",
    color: "#F39C12",
    order: 4,
    status: "active" as const
  },
  {
    name: "العصائر الطبيعية",
    nameEn: "Natural Juices",
    description: "Fresh and natural fruit juices",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/0061650c9228a74090b6905e5a3c5f396dea26b6?width=54",
    color: "#2ECC71",
    order: 5,
    status: "active" as const
  },
  {
    name: "الكوكتيل و الموهيتو",
    nameEn: "Cocktails & Mojitos",
    description: "Refreshing cocktails and mojitos",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/c5fe8d5173faa0d9b636382c2f32a34375dae1d1?width=66",
    color: "#9B59B6",
    order: 6,
    status: "active" as const
  },
  {
    name: "المناقيش و الفطائر",
    nameEn: "Manakish & Pastries",
    description: "Traditional Lebanese flatbreads and pastries",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/621674a75978c3bcd6e88400c0dc63fefc51776d?width=52",
    color: "#E67E22",
    order: 7,
    status: "active" as const
  },
  {
    name: "البيتزا",
    nameEn: "Pizza",
    description: "Freshly made pizzas with various toppings",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/b68ed657334a268ff8c023e2831ae25d0988520a?width=54",
    color: "#E74C3C",
    order: 8,
    status: "active" as const
  },
  {
    name: "السندوتش و البرجر",
    nameEn: "Sandwiches & Burgers",
    description: "Delicious sandwiches and burgers",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/25389b4fee72a8c437f2dfee9b468b47da34a3cc?width=64",
    color: "#8E44AD",
    order: 9,
    status: "active" as const
  },
  {
    name: "الحلا",
    nameEn: "Desserts",
    description: "Sweet treats and desserts",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/f400aa2409f2a47ba2ba36ea8fe85c63e55cfd1c?width=52",
    color: "#F1C40F",
    order: 10,
    status: "active" as const
  },
  {
    name: "الشيشة",
    nameEn: "Shisha",
    description: "Traditional hookah and shisha",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/9b45510037581f790556bf8fdd013550346c228b?width=72",
    color: "#34495E",
    order: 11,
    status: "active" as const
  }
];

// POST endpoint to upload/seed categories
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Insert new categories
    const createdCategories = await Category.insertMany(staticCategories);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully uploaded ${createdCategories.length} categories`,
      data: createdCategories 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
