export type TemplateId = 'classic' | 'modern' | 'minimal' | 'elegant';

export interface MenuTemplate {
  id: TemplateId;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  thumbnail: string;
  features: string[];
  featuresAr: string[];
}

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    nameAr: 'كلاسيكي',
    description: 'Traditional menu layout with grid view and circular thumbnails. Perfect for restaurants with a classic aesthetic.',
    descriptionAr: 'تخطيط قائمة تقليدي بعرض الشبكة والصور المصغرة الدائرية. مثالي للمطاعم ذات الطابع الكلاسيكي.',
    thumbnail: '/templates/classic-preview.png',
    features: [
      'Grid layout with 2 columns',
      'Circular product images',
      'Side-by-side info display',
      'Subtle animations',
      'Best for traditional restaurants'
    ],
    featuresAr: [
      'تخطيط شبكة بعمودين',
      'صور دائرية للمنتجات',
      'عرض المعلومات جنبًا إلى جنب',
      'رسوم متحركة خفيفة',
      'الأفضل للمطاعم التقليدية'
    ]
  },
  {
    id: 'modern',
    name: 'Modern',
    nameAr: 'عصري',
    description: 'Contemporary design with large images, bold typography, and smooth transitions. Ideal for modern cafes and bistros.',
    descriptionAr: 'تصميم معاصر مع صور كبيرة وطباعة جريئة وانتقالات سلسة. مثالي للمقاهي والمطاعم الحديثة.',
    thumbnail: '/templates/modern-preview.png',
    features: [
      'Large, prominent images',
      'Bold card design',
      'Enhanced hover effects',
      'Modern typography',
      'Best for trendy establishments'
    ],
    featuresAr: [
      'صور كبيرة وبارزة',
      'تصميم بطاقة جريء',
      'تأثيرات تمرير محسّنة',
      'طباعة عصرية',
      'الأفضل للمؤسسات العصرية'
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameAr: 'بسيط',
    description: 'Clean, minimalist design focusing on content. Plenty of white space and elegant simplicity.',
    descriptionAr: 'تصميم نظيف وبسيط يركز على المحتوى. مساحة بيضاء واسعة وبساطة أنيقة.',
    thumbnail: '/templates/minimal-preview.png',
    features: [
      'Clean, spacious layout',
      'Minimal visual elements',
      'Focus on typography',
      'Subtle borders and shadows',
      'Best for upscale dining'
    ],
    featuresAr: [
      'تخطيط نظيف وواسع',
      'عناصر بصرية بسيطة',
      'التركيز على الطباعة',
      'حدود وظلال خفيفة',
      'الأفضل للمطاعم الراقية'
    ]
  },
  {
    id: 'elegant',
    name: 'Elegant',
    nameAr: 'أنيق',
    description: 'Sophisticated layout with refined details, elegant spacing, and premium feel. Perfect for fine dining.',
    descriptionAr: 'تخطيط متطور مع تفاصيل راقية ومسافات أنيقة وشعور مميز. مثالي للمطاعم الفاخرة.',
    thumbnail: '/templates/elegant-preview.png',
    features: [
      'Refined card design',
      'Elegant typography',
      'Premium spacing',
      'Sophisticated animations',
      'Best for luxury restaurants'
    ],
    featuresAr: [
      'تصميم بطاقة راقي',
      'طباعة أنيقة',
      'مسافات مميزة',
      'رسوم متحركة متطورة',
      'الأفضل للمطاعم الفاخرة'
    ]
  }
];

export function getTemplateById(id: TemplateId): MenuTemplate | undefined {
  return MENU_TEMPLATES.find(template => template.id === id);
}

export function getDefaultTemplate(): MenuTemplate {
  return MENU_TEMPLATES[0]; // Classic
}
