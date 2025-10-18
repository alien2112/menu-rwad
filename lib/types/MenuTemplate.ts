export type TemplateId = 'classic' | 'modern' | 'minimal' | 'elegant' | 'luxe' | 'vintage' | 'artistic' | 'compact' | 'futuristic' | 'natural' | 'original';

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
  },
  {
    id: 'luxe',
    name: 'Luxe',
    nameAr: 'فخم',
    description: 'Premium dark theme with gold accents, marble textures, and sophisticated animations. Ultimate luxury experience.',
    descriptionAr: 'ثيم داكن فاخر مع لمسات ذهبية وخامات رخامية ورسوم متحركة راقية. تجربة فخامة مطلقة.',
    thumbnail: '/templates/luxe-preview.png',
    features: [
      'Dark luxury theme',
      'Gold accent colors',
      'Marble-inspired textures',
      'Premium micro-interactions',
      'Best for high-end establishments'
    ],
    featuresAr: [
      'ثيم فاخر داكن',
      'ألوان ذهبية لامعة',
      'خامات مستوحاة من الرخام',
      'تفاعلات دقيقة راقية',
      'الأفضل للمطاعم الراقية جداً'
    ]
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameAr: 'تراثي',
    description: 'Classic retro design with warm sepia tones, ornate borders, and nostalgic typography. Perfect for traditional cafes.',
    descriptionAr: 'تصميم كلاسيكي أصيل بألوان دافئة وحدود مزخرفة وطباعة حنينية. مثالي للمقاهي التراثية.',
    thumbnail: '/templates/vintage-preview.png',
    features: [
      'Retro-inspired layout',
      'Warm color palette',
      'Decorative borders',
      'Classic serif fonts',
      'Best for heritage venues'
    ],
    featuresAr: [
      'تخطيط مستوحى من الماضي',
      'لوحة ألوان دافئة',
      'حدود مزخرفة',
      'خطوط كلاسيكية أنيقة',
      'الأفضل للأماكن التراثية'
    ]
  },
  {
    id: 'artistic',
    name: 'Artistic',
    nameAr: 'فني',
    description: 'Creative asymmetric layout with vibrant gradients, artistic shapes, and bold visuals. For contemporary fusion concepts.',
    descriptionAr: 'تخطيط غير متماثل إبداعي مع تدرجات حيوية وأشكال فنية ومرئيات جريئة. لمفاهيم الدمج المعاصرة.',
    thumbnail: '/templates/artistic-preview.png',
    features: [
      'Asymmetric creative layout',
      'Vibrant color gradients',
      'Unique card shapes',
      'Artistic visual effects',
      'Best for fusion restaurants'
    ],
    featuresAr: [
      'تخطيط إبداعي غير متماثل',
      'تدرجات ألوان نابضة',
      'أشكال بطاقات فريدة',
      'تأثيرات بصرية فنية',
      'الأفضل لمطاعم الدمج'
    ]
  },
  {
    id: 'compact',
    name: 'Compact',
    nameAr: 'مضغوط',
    description: 'Dense information layout with small cards, efficient spacing, and quick scanning. Ideal for extensive menus.',
    descriptionAr: 'تخطيط معلومات كثيف ببطاقات صغيرة ومسافات فعالة وسهولة تصفح سريع. مثالي للقوائم الواسعة.',
    thumbnail: '/templates/compact-preview.png',
    features: [
      'High-density layout',
      'Compact card design',
      'Efficient information display',
      'Quick navigation',
      'Best for large menus'
    ],
    featuresAr: [
      'تخطيط عالي الكثافة',
      'تصميم بطاقة مضغوط',
      'عرض معلومات فعال',
      'تنقل سريع',
      'الأفضل للقوائم الكبيرة'
    ]
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    nameAr: 'مستقبلي',
    description: 'Sleek, futuristic design with a dark theme, glowing elements, and sharp angles. Features a horizontal card layout.',
    descriptionAr: 'تصميم مستقبلي أنيق مع سمة داكنة وعناصر متوهجة وزوايا حادة. يتميز بتصميم بطاقة أفقي.',
    thumbnail: '/templates/futuristic-preview.png',
    features: [
      'Horizontal card layout',
      'Dark theme with glowing accents',
      'Expandable details section',
      'Cyberpunk-inspired aesthetics',
      'Best for modern, tech-focused venues'
    ],
    featuresAr: [
      'تصميم بطاقة أفقي',
      'سمة داكنة مع لمسات متوهجة',
      'قسم تفاصيل قابل للتوسيع',
      'جماليات مستوحاة من السايبربانك',
      'الأفضل للأماكن الحديثة والتقنية'
    ]
  },
  {
    id: 'natural',
    name: 'Natural',
    nameAr: 'طبيعي',
    description: 'Light and airy design with a focus on natural textures and colors. Features a clean, simple layout and an ingredients list.',
    descriptionAr: 'تصميم خفيف ومتجدد مع التركيز على الخامات والألوان الطبيعية. يتميز بتصميم نظيف وبسيط وقائمة مكونات.',
    thumbnail: '/templates/natural-preview.png',
    features: [
      'Light, airy design',
      'Focus on natural textures',
      'Clean and simple layout',
      'Displays key ingredients',
      'Best for health-focused or organic restaurants'
    ],
    featuresAr: [
      'تصميم خفيف ومتجدد',
      'التركيز على الخامات الطبيعية',
      'تصميم نظيف وبسيط',
      'عرض المكونات الرئيسية',
      'الأفضل للمطاعم الصحية أو العضوية'
    ]
  },
  {
    id: 'original',
    name: 'Original',
    nameAr: 'الأصلي',
    description: 'Classic maraksh design with glassmorphism effects, circular images in list view, and rectangular cards in grid view. The original restaurant menu style.',
    descriptionAr: 'تصميم مرقش الكلاسيكي مع تأثيرات زجاجية، صور دائرية في عرض القائمة، وبطاقات مستطيلة في عرض الشبكة. التصميم الأصلي لقائمة المطعم.',
    thumbnail: '/templates/original-preview.svg',
    features: [
      'Glassmorphism backdrop blur',
      'Circular images in list view',
      'Rectangular cards in grid view',
      'Different layouts per view mode',
      'Best for traditional restaurant menus'
    ],
    featuresAr: [
      'تأثيرات زجاجية مع ضبابية',
      'صور دائرية في عرض القائمة',
      'بطاقات مستطيلة في عرض الشبكة',
      'تخطيطات مختلفة لكل وضع عرض',
      'الأفضل لقوائم المطاعم التقليدية'
    ]
  }
];

export function getTemplateById(id: TemplateId): MenuTemplate | undefined {
  return MENU_TEMPLATES.find(template => template.id === id);
}

export function getDefaultTemplate(): MenuTemplate {
  return MENU_TEMPLATES[0]; // Classic
}
