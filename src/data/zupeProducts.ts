import { Product, HowToUseConfig } from "@/types/product";

export interface VittalDigitalProduct {
  id: string;
  name: string;
  packageDescription: string;
  price: number;
  mrp: number;
  savings: number;
  badge?: string;
  freeBonus?: string;
  image: string;
  popular?: boolean;
}

// Backward-compatible alias for any legacy imports
export type TurkiyeJamVariant = VittalDigitalProduct;

export const VITTAL_DIGITAL_DEALS: VittalDigitalProduct[] = [
  {
    id: "wireless-earbuds",
    name: "Wireless Earbuds ANC",
    packageDescription: "Hybrid ANC + 36h Playback + Dubai Import Warranty",
    price: 2999,
    mrp: 3999,
    savings: 1000,
    badge: "Deal",
    freeBonus: "Fast Charging Cable Included",
    image: "/vittal/wireless-earbuds.png",
    popular: true,
  },
  {
    id: "portable-bluetooth-speaker",
    name: "Portable Bluetooth Speaker",
    packageDescription: "24W 360° Stereo Bass + IP67 Waterproof",
    price: 3999,
    mrp: 4999,
    savings: 1000,
    badge: "Deal",
    freeBonus: "Free Protective Carrying Strap",
    image: "/vittal/portable-bluetooth-speaker.png",
    popular: false,
  },
  {
    id: "smart-watch-pro",
    name: "Smart Watch Pro",
    packageDescription: "1.43\" AMOLED Display + BT Calling + Titanium Bezel",
    price: 5999,
    mrp: 7999,
    savings: 2000,
    badge: "Deal",
    freeBonus: "Free Extra Silicone Strap",
    image: "/vittal/smart-watch-pro.png",
    popular: true,
  },
  {
    id: "compact-power-bank",
    name: "Compact Power Bank 10000mAh",
    packageDescription: "22.5W Fast Charging + Digital LED Display",
    price: 1499,
    mrp: 1999,
    savings: 500,
    badge: "Deal",
    freeBonus: "Braided USB-C Cable",
    image: "/vittal/compact-power-bank.png",
    popular: false,
  },
];

export const TURKIYE_JAM_VARIANTS = VITTAL_DIGITAL_DEALS;

const COMMON_FEATURES = [
  "Direct Import from Dubai (UAE Retail Stock with Authenticity Guarantee)",
  "100% Compatible with Indian Telecommunications, 5G & 230V Standards",
  "1-Year Comprehensive International Warranty with Doorstep Service in India",
  "Insured Express Air Logistics: 2–4 Business Days Doorstep Delivery",
  "Tamper-Evident Safety Packaging with Holographic Verification Seal",
  "Hassle-Free 7-Day Replacement Guarantee for Hardware Defects",
];

const COMMON_SPECS = {
  "Sourcing Hub": "Dubai, United Arab Emirates (UAE Direct Retail)",
  "India Compatibility": "100% Fully Compatible with Indian Cellular Networks & 230V Mains",
  "Warranty": "1-Year International Warranty with Doorstep Service Support in India",
  "Packaging": "Insured Heavy-Duty Shockproof Transit Box with Serial Trackability",
  "Express Shipping": "Fast Dispatch within 24h from Regional Customs Air Gateway",
  "Payment Modes": "Prepaid UPI, Credit/Debit Cards, NetBanking, EMI & Fastrr Checkout",
};

const COMMON_WHATS_IN_BOX = [
  "1 × Authentic Dubai Retail Device (Sealed in Original Manufacturer Packaging)",
  "Universal Indian Standard Fast Charging Cable & Adapter",
  "Vittal Digital Warranty Certificate & Quick Start Documentation",
];

const COMMON_SHIPPING = [
  "Air Express Logistics: Dispatched within 24 hours of confirmation.",
  "Tracked Every Mile: Real-time tracking via SMS and WhatsApp updates.",
  "100% Insured Delivery: Full protection against transit damage or loss.",
];

const COMMON_RETURNS = [
  "7-Day Hardware Replacement Guarantee on all electronics.",
  "Dedicated Tech Concierge on WhatsApp 7 days a week.",
  "Transparent Doorstep Pickup & Rapid Resolution.",
];

const COMMON_HOW_TO_USE: HowToUseConfig = {
  enabled: true,
  section_bg: "white",
  card_radius: "rounded-2xl",
  card_border: "subtle",
  card_shadow: "sm",
  steps: [
    {
      id: "step-1",
      media_type: "image",
      media_url: "/vittal/ultraslim-laptop-14.png",
      media_fit: "contain",
      title: "1. Unbox & Inspect Tamper Seal",
      description: "Break the tamper-evident holographic seal and inspect the device and accessories.",
    },
    {
      id: "step-2",
      media_type: "image",
      media_url: "/vittal/compact-power-bank.png",
      media_fit: "contain",
      title: "2. Initial Charge",
      description: "Connect using the provided certified high-speed charger to bring battery to 100%.",
    },
    {
      id: "step-3",
      media_type: "image",
      media_url: "/vittal/smart-watch-pro.png",
      media_fit: "contain",
      title: "3. Power On & Instant Setup",
      description: "Follow the on-screen instructions for instant pairing with your smartphone or network.",
    },
    {
      id: "step-4",
      media_type: "image",
      media_url: "/vittal/wireless-earbuds.png",
      media_fit: "contain",
      title: "4. Register Warranty",
      description: "Scan the Vittal Digital QR card inside the box to activate your 1-year India warranty.",
    },
  ],
};

const COMMON_REVIEWS = {
  average: 4.8,
  total: 820,
  breakdown: [
    { star: 5, percentage: 88 },
    { star: 4, percentage: 9 },
    { star: 3, percentage: 2 },
    { star: 2, percentage: 1 },
    { star: 1, percentage: 0 },
  ],
  user_photos: [
    { image: "/vittal/ultraslim-laptop-14.png" },
    { image: "/vittal/smart-watch-pro.png" },
    { image: "/vittal/everyday-tablet-11.png" },
    { image: "/vittal/wireless-earbuds.png" },
  ],
  list: [
    {
      id: "rev-1",
      author: "Customer A",
      avatar: "/avatars/avatar-1.jpg",
      date: "2 days ago",
      rating: 5,
      verified: true,
      comment: "A simple shopping experience from start to finish. Sourced directly from Dubai, delivery was fast, and the device was 100% brand new and sealed.",
      images: ["/vittal/ultraslim-laptop-14.png"],
    },
    {
      id: "rev-2",
      author: "Customer B",
      avatar: "/avatars/avatar-2.jpg",
      date: "4 days ago",
      rating: 5,
      verified: true,
      comment: "Easy to browse and choose the right gadget. The UltraSlim Laptop 14 is blazing fast with incredible battery life. Highly recommended!",
    },
    {
      id: "rev-3",
      author: "Customer C",
      avatar: "/avatars/avatar-3.jpg",
      date: "1 week ago",
      rating: 5,
      verified: true,
      comment: "Helpful product information and clear updates. Received the Wireless Earbuds in pristine condition with 36hr battery life. Exceptional value.",
      images: ["/vittal/wireless-earbuds.png"],
    },
  ],
};

const BASE_DESC = "Imported directly from Dubai retail hubs, Vittal Digital brings world-class consumer electronics to doorsteps across India. Enjoy premier hardware, international manufacturer quality, 1-year warranty coverage, and insured express delivery.";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "ultraslim-laptop-14",
    slug: "ultraslim-laptop-14",
    name: "UltraSlim Laptop 14",
    subtitle: "High-Performance Lightweight Workstation",
    category: "Laptops",
    subcategory: "Ultraportables",
    tagline: "Power Your Work. Built for your next big idea.",
    description: "Sleek, powerful ultra-portable laptop imported from Dubai with vibrant 2.8K OLED display, 16GB LPDDR5 RAM, 512GB NVMe SSD, and up to 16 hours of battery life.",
    price: 54990,
    mrp: 69990,
    offer_price: 54990,
    cost_price: 46000,
    stock_count: 35,
    volume: "14-inch OLED / 16GB / 512GB",
    poster_image: "/vittal/ultraslim-laptop-14.png",
    images: ["/vittal/ultraslim-laptop-14.png"],
    color: "Space Gray",
    material: "CNC Aluminum Unibody",
    in_stock: 1,
    rating: 4.8,
    review_count: 324,
    sold_count: "1,200+ delivered across India",
    badge: "New",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: {
      ...COMMON_SPECS,
      "Display": "14-inch 2.8K OLED 120Hz 500-nit Screen",
      "Memory & Storage": "16GB LPDDR5 RAM + 512GB NVMe SSD",
      "Battery": "70Wh (Up to 16 Hours)",
    },
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "smart-watch-pro",
    slug: "smart-watch-pro",
    name: "Smart Watch Pro",
    subtitle: "Aerospace-Grade Titanium Lifestyle Watch",
    category: "Smartwatches",
    subcategory: "Fitness & Lifestyle",
    tagline: "Smarter Every Day. Stay connected. Keep moving.",
    description: "Advanced 1.43\" AMOLED fitness & lifestyle smartwatch with crystal-clear Bluetooth calling, 24/7 health tracking, 14-day battery life, and durable titanium bezel.",
    price: 6990,
    mrp: 9990,
    offer_price: 6990,
    cost_price: 4900,
    stock_count: 65,
    volume: "1.43-inch AMOLED / Titanium Bezel",
    poster_image: "/vittal/smart-watch-pro.png",
    images: ["/vittal/smart-watch-pro.png"],
    color: "Titanium Silver",
    material: "Aerospace Titanium & Sapphire Glass",
    in_stock: 1,
    rating: 4.7,
    review_count: 540,
    sold_count: "2,800+ delivered across India",
    badge: "Trending",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: {
      ...COMMON_SPECS,
      "Display": "1.43-inch Ultra AMOLED Always-On 466x466",
      "Connectivity": "Bluetooth 5.3 Calling + Dual-Band GPS",
      "Battery": "14 Days Typical Use",
    },
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "everyday-tablet-11",
    slug: "everyday-tablet-11",
    name: "Everyday Tablet 11",
    subtitle: "Immersive 2K Entertainment & Productivity Tablet",
    category: "Tablets",
    subcategory: "Pro Tablets",
    tagline: "Crisp 2K Display with Dolby Atmos Audio",
    description: "11-inch crisp 2K display tablet perfect for productivity, streaming, and creative work with quad stereo speakers and 8,000mAh battery.",
    price: 24990,
    mrp: 32990,
    offer_price: 24990,
    cost_price: 19500,
    stock_count: 40,
    volume: "11-inch 2K / 8GB / 128GB",
    poster_image: "/vittal/everyday-tablet-11.png",
    images: ["/vittal/everyday-tablet-11.png"],
    color: "Nordic Blue",
    material: "Anodized Aluminum",
    in_stock: 1,
    rating: 4.8,
    review_count: 218,
    sold_count: "850+ delivered across India",
    badge: "Best Seller",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: {
      ...COMMON_SPECS,
      "Display": "11-inch 2K IPS 90Hz Display",
      "Audio": "Quad Speakers with Dolby Atmos Sound",
      "Battery": "8,000mAh with 33W Fast Charge",
    },
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "wireless-earbuds",
    slug: "wireless-earbuds",
    name: "Wireless Earbuds",
    subtitle: "Active Noise Cancellation (ANC) True Wireless",
    category: "Headphones & Earbuds",
    subcategory: "True Wireless",
    tagline: "Feel Every Beat. Your world. Better sound.",
    description: "Hybrid 42dB Active Noise Cancellation (ANC), 36-hour total playback, high-definition 11mm dynamic drivers, and IPX5 sweat resistance.",
    price: 2999,
    mrp: 3999,
    offer_price: 2999,
    cost_price: 1900,
    stock_count: 120,
    volume: "36h Playback / Hybrid ANC",
    poster_image: "/vittal/wireless-earbuds.png",
    images: ["/vittal/wireless-earbuds.png"],
    color: "Gloss White",
    material: "Polycarbonate with Matte Case",
    in_stock: 1,
    rating: 4.6,
    review_count: 890,
    sold_count: "4,600+ delivered across India",
    badge: "Deal",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: {
      ...COMMON_SPECS,
      "Noise Cancellation": "Up to 42dB Hybrid Active Noise Cancellation",
      "Battery Life": "36 Hours Total with USB-C Fast Charge Case",
      "Drivers": "11mm Dynamic Acoustic Drivers",
    },
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "portable-bluetooth-speaker",
    slug: "portable-bluetooth-speaker",
    name: "Portable Bluetooth Speaker",
    subtitle: "360° Heavy Bass Waterproof Speaker",
    category: "Speakers",
    subcategory: "Bluetooth Audio",
    tagline: "Immersive 360° Sound with 20h Playback",
    description: "Rugged IP67 waterproof outdoor speaker delivering 24W 360-degree punchy bass, 20 hours battery life, and dual TWS wireless pairing.",
    price: 3999,
    mrp: 4999,
    offer_price: 3999,
    cost_price: 2600,
    stock_count: 80,
    volume: "24W Output / IP67 Waterproof",
    poster_image: "/vittal/portable-bluetooth-speaker.png",
    images: ["/vittal/portable-bluetooth-speaker.png"],
    color: "Midnight Black",
    material: "Silicon & Fabric Mesh",
    in_stock: 1,
    rating: 4.7,
    review_count: 412,
    sold_count: "1,900+ delivered across India",
    badge: "Popular",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: {
      ...COMMON_SPECS,
      "Output": "24W 360-Degree Stereo Sound",
      "Playtime": "Up to 20 Hours Playback",
      "Protection": "IP67 Waterproof & Dustproof",
    },
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "compact-power-bank",
    slug: "compact-power-bank",
    name: "Compact Power Bank 10000mAh",
    subtitle: "22.5W Fast Charging Ultra-Slim Power Bank",
    category: "Smart Gadgets",
    subcategory: "Power & Charging",
    tagline: "High-Density Fast Power On The Go",
    description: "Pocket-sized 10,000mAh power bank featuring 22.5W USB-C Power Delivery, QuickCharge 3.0, and high-contrast digital LED percentage display.",
    price: 1499,
    mrp: 1999,
    offer_price: 1499,
    cost_price: 850,
    stock_count: 150,
    volume: "10,000mAh / 22.5W PD",
    poster_image: "/vittal/compact-power-bank.png",
    images: ["/vittal/compact-power-bank.png"],
    color: "Deep Navy",
    material: "Fireproof ABS Shell",
    in_stock: 1,
    rating: 4.7,
    review_count: 630,
    sold_count: "3,100+ delivered across India",
    badge: "Deal",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: {
      ...COMMON_SPECS,
      "Capacity": "10,000mAh Lithium-Polymer",
      "Max Output": "22.5W USB-C PD / QC 3.0",
      "Display": "Digital LED Percentage Indicator",
    },
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
];

export const PRODUCT_CATEGORIES = [
  "All Categories",
  "Laptops",
  "Tablets",
  "Headphones & Earbuds",
  "Smartphones",
  "Smartwatches",
  "Gaming & Accessories",
  "Speakers",
  "Smart Gadgets",
];

export interface SubcategoryGroup {
  mainCategory: string;
  subcategories: string[];
}

export const CATEGORY_SUBCATEGORIES_CONFIG: SubcategoryGroup[] = [
  {
    mainCategory: "Laptops",
    subcategories: ["Ultraportables", "Gaming Laptops", "MacBooks", "2-in-1 Convertibles"],
  },
  {
    mainCategory: "Tablets",
    subcategories: ["Pro Tablets", "iPads", "Android Tablets", "Stylus Accessories"],
  },
  {
    mainCategory: "Headphones & Earbuds",
    subcategories: ["True Wireless", "Over-Ear ANC", "Sports Earphones", "Gaming Headsets"],
  },
  {
    mainCategory: "Smartphones",
    subcategories: ["Flagships", "Dubai Exclusive Editions", "Foldables", "Budget Kings"],
  },
  {
    mainCategory: "Smartwatches",
    subcategories: ["Fitness & Lifestyle", "Luxury Smartwatches", "GPS Running Watches", "Kids Watches"],
  },
  {
    mainCategory: "Gaming & Accessories",
    subcategories: ["Consoles", "Controllers", "Mechanical Keyboards", "Gaming Mice"],
  },
  {
    mainCategory: "Speakers",
    subcategories: ["Bluetooth Audio", "Soundbars", "Smart Home Speakers", "Party Speakers"],
  },
  {
    mainCategory: "Smart Gadgets",
    subcategories: ["Power & Charging", "Smart Drones", "Smart Plugs", "Car Tech"],
  },
];

export const CATEGORY_SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Laptops": ["Ultraportables", "Gaming Laptops", "MacBooks", "2-in-1 Convertibles"],
  "Tablets": ["Pro Tablets", "iPads", "Android Tablets", "Stylus Accessories"],
  "Headphones & Earbuds": ["True Wireless", "Over-Ear ANC", "Sports Earphones", "Gaming Headsets"],
  "Smartphones": ["Flagships", "Dubai Exclusive Editions", "Foldables", "Budget Kings"],
  "Smartwatches": ["Fitness & Lifestyle", "Luxury Smartwatches", "GPS Running Watches", "Kids Watches"],
  "Gaming & Accessories": ["Consoles", "Controllers", "Mechanical Keyboards", "Gaming Mice"],
  "Speakers": ["Bluetooth Audio", "Soundbars", "Smart Home Speakers", "Party Speakers"],
  "Smart Gadgets": ["Power & Charging", "Smart Drones", "Smart Plugs", "Car Tech"],
};

export function getSubcategoriesForCategory(categoryName: string, dynamicCategories?: any[]): string[] {
  if (CATEGORY_SUBCATEGORIES_MAP[categoryName]) {
    return CATEGORY_SUBCATEGORIES_MAP[categoryName];
  }
  return ["All Tech", "Dubai Imports", "Best Sellers", "Seasonal Deals"];
}

export function doesCategoryMatch(productCategory: string, selectedCategory: string, dynamicCategories?: any[]): boolean {
  if (!selectedCategory || selectedCategory === "All Categories" || selectedCategory === "all" || selectedCategory === "All Products") return true;
  return productCategory.toLowerCase() === selectedCategory.toLowerCase();
}

export function doesSubcategoryMatch(product: Product, selectedSubcategory: string): boolean {
  if (!selectedSubcategory || selectedSubcategory === "All") return true;
  return product.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase();
}
