# Maraksh Restaurant - Next.js

A modern, production-ready Next.js application recreating the Maraksh restaurant website with both the main landing page and interactive menu system.

## Project Structure

```
marakshv2/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with RTL support
│   ├── globals.css              # Global styles with both design systems
│   ├── page.tsx                 # Main landing page (coffee shop design)
│   ├── menu/                    # Menu pages
│   │   └── page.tsx            # Menu grid page
│   ├── tea/                     # Menu detail pages
│   ├── cold-coffee/
│   ├── hot-coffee/
│   ├── natural-juices/
│   ├── cocktails/
│   ├── manakish/
│   ├── pizza/
│   ├── sandwiches/
│   ├── desserts/
│   ├── shisha/
│   ├── about/                   # Info pages with sidebar
│   ├── services/
│   ├── offers/
│   └── contact/
├── components/                   # Reusable components
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── NotificationCard.tsx     # Glass-morphism card
│   └── MenuDetailTemplate.tsx   # Template for menu pages
├── lib/
│   └── utils.ts                 # Utility functions
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind with custom colors
└── tsconfig.json                # TypeScript configuration

```

## Features

### Design Systems

1. **Coffee Shop Design** (Main page, About, Services, Offers, Contact)
   - Glass morphism effects
   - Coffee-themed color palette
   - Arabic-first layout with RTL support
   - Mobile-first responsive design
   - Sidebar navigation

2. **Menu System Design** (Menu grid and detail pages)
   - Restaurant menu layout
   - Category-based navigation
   - Interactive menu items
   - Price display
   - Smooth animations

### Routes

- `/` - Main landing page with coffee shop branding
- `/menu` - Interactive menu grid with 11 categories
- `/tea`, `/cold-coffee`, `/hot-coffee` - Beverage menus
- `/natural-juices`, `/cocktails` - Drink menus
- `/manakish`, `/pizza`, `/sandwiches`, `/desserts` - Food menus
- `/shisha` - Shisha menu
- `/about`, `/services`, `/offers`, `/contact` - Information pages

### Key Components

- **Sidebar**: Slide-out navigation menu with glass effect
- **NotificationCard**: Reusable card component with glass morphism
- **MenuDetailTemplate**: Template for consistent menu page layouts

### Styling

- **Tailwind CSS** with custom configuration
- **Custom CSS variables** for both design systems
- **Glass morphism effects** using backdrop-blur
- **Custom fonts**: Cairo, Inter, Marcellus SC, Seymour One
- **RTL (Right-to-Left)** support for Arabic text
- **Responsive design** with mobile-first approach

### Color Palette

```css
/* Coffee Shop Theme */
--coffee-primary: #4F3500 (Dark coffee brown)
--coffee-secondary: #3E2901 (Darker brown)
--coffee-green: #00BF89 (Green accent)
--coffee-gold: Golden/amber
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Technical Details

### Next.js Configuration

- **App Router**: Using Next.js 15 App Router for modern routing
- **Image Optimization**: Configured for Builder.io images
- **TypeScript**: Full TypeScript support
- **RTL Layout**: HTML and body configured for RTL

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Design Features

### Glass Morphism

Multiple glass effect variants:
- `.glass-effect` - Basic glass with blur
- `.glass-notification` - Cards with shadow
- `.glass-sidebar` - Sidebar overlay
- `.glass-button` - Interactive buttons
- `.glass-green-button` - Primary action buttons

### Animations

- Slide-in animations for menu items
- Staggered entrance effects
- Smooth transitions on hover
- Backdrop blur effects

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires CSS backdrop-filter support for best experience

## Notes

- All text content is in Arabic
- Images hosted on Builder.io CDN
- Optimized for mobile-first experience
- Production-ready with proper SEO setup

## Troubleshooting

### SWC Binary Issues

If you encounter SWC loading errors on Windows:

```bash
npm install @next/swc-wasm-nodejs
```

The app will automatically fall back to WASM-based compilation.

## Credits

Design and content for Maraksh Restaurant (موال مراكش)
- Location: المدينة المنورة - حي النبلاء
- Phone: 966567833138+
