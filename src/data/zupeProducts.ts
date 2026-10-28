import { Product } from "@/types/product";

export interface TurkiyeJamVariant {
  id: string;
  name: string;
  malayalamTitle: string;
  price: number;
  mrp: number;
  savings: number;
  badge?: string;
  freeBonus?: string;
  image: string;
  popular?: boolean;
}

export const TURKIYE_JAM_VARIANTS: TurkiyeJamVariant[] = [
  {
    id: "bottle-240g",
    name: "240g Bottle + 2 Strip Free",
    malayalamTitle: "240 ഗ്രാം ബോട്ടിൽ + 2 സ്ട്രിപ്പ് സൗജന്യം",
    price: 2899,
    mrp: 4999,
    savings: 2100,
    badge: "BEST VALUE",
    freeBonus: "+ 2 Free Strips Included",
    image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
    popular: true,
  },
  {
    id: "box-14-strips",
    name: "12 + 2 Strip Packet Box",
    malayalamTitle: "12 + 2 സ്ട്രിപ്പ് പാക്കറ്റ് ബോക്സ് (ആകെ 14 എണ്ണം)",
    price: 2899,
    mrp: 4999,
    savings: 2100,
    badge: "FULL BOX",
    freeBonus: "14 Total Sachets",
    image: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
    popular: false,
  },
  {
    id: "pack-6-strips",
    name: "6 Strip Pack",
    malayalamTitle: "6 സ്ട്രിപ്പ് പാക്ക്",
    price: 1899,
    mrp: 2999,
    savings: 1100,
    badge: "SAVER PACK",
    freeBonus: "Economical Pack",
    image: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
    popular: false,
  },
  {
    id: "pack-4-strips",
    name: "4 Strip Pack",
    malayalamTitle: "4 സ്ട്രിപ്പ് പാക്ക്",
    price: 1399,
    mrp: 2199,
    savings: 800,
    badge: "POPULAR",
    freeBonus: "Multi-Use Pack",
    image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    popular: false,
  },
  {
    id: "pack-3-strips",
    name: "3 Strip Pack",
    malayalamTitle: "3 സ്ട്രിപ്പ് പാക്ക്",
    price: 1099,
    mrp: 1699,
    savings: 600,
    badge: "STANDARD",
    freeBonus: "Weekend Special",
    image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    popular: false,
  },
  {
    id: "pack-2-strips",
    name: "2 Strip Trial Pack",
    malayalamTitle: "2 സ്ട്രിപ്പ് ട്രയൽ പാക്ക്",
    price: 899,
    mrp: 1299,
    savings: 400,
    badge: "TRIAL PACK",
    freeBonus: "Starter Pack",
    image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    popular: false,
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "turkiye-jam",
    slug: "turkiye-jam-epimedium-macun",
    name: "Themra Epimedyumlu Macun - തുർക്കി ജാം",
    subtitle: "100% Original Turkish Herbal Paste for Men & Women",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "സ്ത്രീകൾക്കും പുരുഷന്മാർക്കും അത്ഭുത ഉൽപന്നം • 100% ഒറിജിനൽ തുർക്കി ജാം",
    description:
      "തുർക്കിയിൽ നിന്ന് നേരിട്ട് ഇറക്കുമതി ചെയ്യുന്ന 100% ഒറിജിനൽ തെംറ എപ്പിമീഡിയം മാക്കൂൻ (Themra Epimedium Bitkisel Macun). പുരുഷന്മാരിൽ അസാധാരണ കരുത്തും സ്റ്റാമിനയും ദീർഘനേരത്തെ സമയക്കൂടുതലും നൽകുന്നു. സ്ത്രീകളിൽ സ്വാഭാവിക ലൈംഗിക ആഗ്രഹവും ആനന്ദവും വർദ്ധിപ്പിക്കുന്നു. 100% പ്രകൃതിദത്ത കൂട്ട്.",
    price: 2899,
    mrp: 4999,
    offer_price: 2899,
    stock_count: 150,
    volume: "240g Jar & Strips Available",
    poster_image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
    images: [
      "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
      "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
      "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
      "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
    ],
    color: "240g Bottle + 2 Strip Free",
    material: "100% Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ sold in Kerala",
    badge: "Sale",
    has_colors: true,
    colors: [
      {
        name: "240g Bottle + 2 Strip Free",
        image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
        colorHex: "#780016",
        images: [
          "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
        ],
      },
      {
        name: "12+2 Strip Packet Box",
        image: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
        colorHex: "#8B0000",
        images: [
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
        ],
      },
      {
        name: "6 Strip Pack",
        image: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
        colorHex: "#9E1B32",
        images: [
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
        ],
      },
      {
        name: "4 Strip Pack",
        image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
        colorHex: "#B31B1B",
        images: [
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
        ],
      },
      {
        name: "3 Strip Pack",
        image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
        colorHex: "#C41E3A",
        images: [
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
        ],
      },
      {
        name: "2 Strip Trial Pack",
        image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
        colorHex: "#800020",
        images: [
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
        ],
      },
    ],
    features: [
      "100% ഒറിജിനൽ തുർക്കി നിർമ്മിതം (Themra Bitkisel Ürünler Turkey)",
      "പുരുഷൻമാരിൽ: അതിശയകരമായ ശക്തിയും സമയക്കൂടുതലും",
      "പുരുഷൻമാരിൽ: ഒരേ സമയം കൂടുതൽ തവണ ചെയ്യാനുള്ള കരുത്ത്",
      "സ്ത്രീകളിൽ: ലൈംഗിക ആഗ്രഹവും ആനന്ദവും വർദ്ധിപ്പിക്കുന്നു",
      "കേരളത്തിൽ 1 ദിവസം കൊണ്ട് അതിവേഗ ഡെലിവറി 🚚",
      "100% സുരക്ഷിതവും രഹസ്യവുമായ പാക്കിങ് (Discreet Packaging) 📦",
      "റിസൾട്ട് ലഭിച്ചില്ലെങ്കിൽ ബാലൻസ് സ്ട്രിപ്പിന് 100% മണി-ബാക്ക് റീഫണ്ട് 🛡️",
    ],
    specifications: {
      "ഉൽപ്പന്നം (Product)": "Themra Epimedyumlu Macun (തുർക്കി ജാം)",
      "നിർമ്മാണം (Origin)": "Made in Turkey 🇹🇷 (Themra Bitkisel)",
      "പ്രധാന ചേരുവകൾ (Ingredients)": "Epimedium, Honey, Royal Jelly, Red Ginseng, Ginger, Maca Root, Cinnamon",
      "ഉപയോഗം (Audience)": "സ്ത്രീകൾക്കും പുരുഷന്മാർക്കും (18 വയസ്സിന് മുകളിൽ)",
      "പാക്കിങ് (Packaging)": "100% Discreet & Opaque Plain Box",
      "ഡെലിവറി സമയം (Prepaid)": "1–2 ദിവസം (Kerala Express)",
      "ഡെലിവറി സമയം (COD)": "3–7 ദിവസം (All India Doorstep)",
    },
    whats_in_box: [
      "1 × ഒറിജിനൽ തുർക്കി ജാം (തിരഞ്ഞെടുത്ത പാക്കേജ്)",
      "ബോണസ് ഫ്രീ സ്ട്രിപ്പുകൾ (240g Bottle & 12-Strip ബോക്സിനൊപ്പം)",
      "മലയാളത്തിലും ഇംഗ്ലീഷിലുമുള്ള സമ്പൂർണ്ണ ഉപയോഗ ഗൈഡ്",
      "100% സുരക്ഷിതമായ രഹസ്യ ഔട്ടർ പാക്കിങ് ബോക്സ്",
    ],
    shipping_info: [
      "കേരളത്തിൽ അതിവേഗ ഡെലിവറി: ഓർഡർ നൽകി 24 മണിക്കൂറിനകം ഡിസ്പാച്ച് ചെയ്യപ്പെടുന്നു.",
      "Prepaid (ഓൺലൈൻ പേയ്മെന്റ്): ₹60 മാത്രം അധികം (1-2 ദിവസത്തിനകം എക്സ്പ്രസ് ഡെലിവറി).",
      "Cash on Delivery (ക്യാഷ് ഓൺ ഡെലിവറി): ₹190 അധികം (3-7 ദിവസത്തിനകം ഡോർസ്റ്റെപ്പ് ഡെലിവറി).",
      "100% Discreet Packaging: പെട്ടിക്ക് പുറത്ത് ഉൽപ്പന്നത്തിന്റെ പേരോ ഉള്ളടക്കമോ കാണിക്കാത്ത തികച്ചും സുരക്ഷിതമായ പാക്കിങ്.",
    ],
    return_info: [
      "ബാലൻസ് സ്ട്രിപ്പ് റീഫണ്ട് ഗ്യാരണ്ടി: സ്ട്രിപ്പുകൾ ഉപയോഗിച്ചിട്ട് ഫലം ലഭിച്ചില്ലെങ്കിൽ ബാക്കിയുള്ള സ്ട്രിപ്പുകൾ നിങ്ങൾക്ക് തിരിച്ചയക്കാം.",
      "പൂർണ്ണ റീഫണ്ട്: തിരിച്ചയക്കുന്ന സ്ട്രിപ്പുകളുടെ തുക നിങ്ങളുടെ ബാങ്ക് / UPI അക്കൗണ്ടിലേക്ക് റീഫണ്ട് ചെയ്യുന്നതായിരിക്കും.",
      "WhatsApp സപ്പോർട്ട്: സംശയങ്ങൾക്കും റീഫണ്ടിനും നേരിട്ട് ഞങ്ങളുടെ WhatsApp കസ്റ്റമർ കെയറുമായി ബന്ധപ്പെടാം.",
    ],
    how_to_use: {
      enabled: true,
      section_bg: "white",
      card_radius: "rounded-2xl",
      card_border: "subtle",
      card_shadow: "sm",
      steps: [
        {
          id: "step-1",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
          media_fit: "contain",
          title: "1. ലൈംഗിക ബന്ധത്തിന് 1 മണിക്കൂർ മുമ്പ് ഭക്ഷണം കഴിക്കുക",
          description: "വെറും വയറ്റിൽ ഒരിക്കലും കഴിക്കരുത്. ബന്ധപ്പെടുന്നതിന് 1 മണിക്കൂർ മുൻപായി സാധാരണ ഭക്ഷണം കഴിക്കുക.",
        },
        {
          id: "step-2",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          media_fit: "contain",
          title: "2. 10 മിനിറ്റിനു ശേഷം ഒരു ചെറിയ സ്പൂൺ അല്ലെങ്കിൽ 1 സ്ട്രിപ്പ് കഴിക്കുക",
          description: "ഭക്ഷണം കഴിഞ്ഞ് 10 മിനിറ്റ് കഴിഞ്ഞ് കൃത്യം 1 ചെറിയ സ്പൂൺ (കുപ്പിയെങ്കിൽ) അല്ലെങ്കിൽ 1 സ്ട്രിപ്പ് നേരിട്ട് വായിലേക്ക് ഒഴിച്ച് കഴിക്കുക.",
        },
        {
          id: "step-3",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
          media_fit: "contain",
          title: "3. കുപ്പിയാണെങ്കിൽ കഴിക്കുന്നതിന് മുമ്പ് നന്നായി ഇളക്കുക",
          description: "ബോട്ടിൽ ഉപയോഗിക്കുമ്പോൾ എണ്ണമയവും തേനും സസ്യച്ചേരുവകളും അടിഞ്ഞിരിക്കാൻ സാധ്യതയുള്ളതിനാൽ നന്നായി ഇളക്കിയ ശേഷം മാത്രം എടുക്കുക.",
        },
        {
          id: "step-4",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          media_fit: "contain",
          title: "4. 15 മിനിറ്റ് കഴിഞ്ഞ് ഒരു ഗ്ലാസ് പാൽ കുടിക്കുക",
          description: "സാധ്യമെങ്കിൽ ജാം കഴിച്ച് 15 മിനിറ്റിനു ശേഷം ഒരു ഗ്ലാസ് പാൽ കുടിക്കുന്നത് ഫലം ഇരട്ടിയാക്കാൻ സഹായിക്കും.",
        },
        {
          id: "step-5",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
          media_fit: "contain",
          title: "5. ശീതളപാനീയങ്ങൾ കർശനമായി ഒഴിവാക്കുക",
          description: "ജാമിന് മുകളിലോ ശേഷമോ തണുത്ത പാനീയങ്ങളോ (Cool Drinks / Soda) കുടിക്കരുത്.",
        },
      ],
    },
    reviews_data: {
      average: 4.9,
      total: 1480,
      breakdown: [
        { star: 5, percentage: 92 },
        { star: 4, percentage: 6 },
        { star: 3, percentage: 1 },
        { star: 2, percentage: 1 },
        { star: 1, percentage: 0 },
      ],
      user_photos: [
        { image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg" },
        { image: "/products/turkiye-jam/turkiye-jam-box-strips.jpg" },
        { image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg" },
        { image: "/products/turkiye-jam/turkiye-jam-5-strips.jpg" },
      ],
      list: [
        {
          id: "rev-1",
          author: "Faisal K. (Kozhikode)",
          avatar: "/avatars/avatar-1.jpg",
          date: "Yesterday",
          rating: 5,
          verified: true,
          comment:
            "യഥാർത്ഥ ഒറിജിനൽ തുർക്കി ജാം തന്നെയാണിത്! ആദ്യ സ്ട്രിപ്പ് ഉപയോഗിച്ചപ്പോൾ തന്നെ വിശ്വസിക്കാൻ പറ്റാത്ത റിസൾട്ട് കിട്ടി. സ്റ്റാമിനയും സമയക്കൂടുതലും അത്ഭുതപ്പെടുത്തി. പാക്കിങ് വളരെ രഹസ്യമായിരുന്നു. താങ്ക് യു!",
          images: ["/products/turkiye-jam/turkiye-jam-3-strips.jpg"],
        },
        {
          id: "rev-2",
          author: "Anonymous Couple (Kochi)",
          avatar: "/avatars/avatar-2.jpg",
          date: "3 days ago",
          rating: 5,
          verified: true,
          comment:
            "We were skeptical at first, but both of us tried it as per instructions with warm milk. Absolutely amazing experience for both partners. Worth every single rupee!",
        },
        {
          id: "rev-3",
          author: "Jithin R. (Thrissur)",
          avatar: "/avatars/avatar-3.jpg",
          date: "5 days ago",
          rating: 5,
          verified: true,
          comment:
            "240g bottle വാങ്ങി. 2 സ്ട്രിപ്പ് ഫ്രീയും കിട്ടി. ഒരൊറ്റ ദിവസം കൊണ്ട് തൃശ്ശൂരിൽ ഡെലിവറി കിട്ടി. 100% geniune product.",
          images: ["/products/turkiye-jam/turkiye-jam-jar-and-box.jpg"],
        },
        {
          id: "rev-4",
          author: "Muhammed Shafi (Malappuram)",
          avatar: "/avatars/avatar-4.jpg",
          date: "1 week ago",
          rating: 5,
          verified: true,
          comment:
            "ബാലൻസ് സ്ട്രിപ്പ് തിരിച്ചയക്കാം എന്ന ഗ്യാരന്റി കണ്ടാണ് വാങ്ങിയത്, പക്ഷെ റിസൾട്ട് കണ്ടപ്പോൾ തിരിച്ചയക്കാൻ തോന്നിയില്ല. അടുത്ത ഓർഡറും ഉടൻ നൽകും.",
        },
      ],
    },
  },
];

export const PRODUCT_CATEGORIES = [
  "All Categories",
  "Herbal Vitality",
  "Men's Stamina",
  "Women's Wellness",
];

export interface SubcategoryGroup {
  mainCategory: string;
  subcategories: string[];
}

export const CATEGORY_SUBCATEGORIES_CONFIG: SubcategoryGroup[] = [
  {
    mainCategory: "Herbal Vitality",
    subcategories: ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"],
  },
];

export const CATEGORY_SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Herbal Vitality": ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"],
};

export function getSubcategoriesForCategory(categoryName: string, dynamicCategories?: any[]): string[] {
  return ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"];
}

export function doesCategoryMatch(productCategory: string, selectedCategory: string, dynamicCategories?: any[]): boolean {
  if (!selectedCategory || selectedCategory === "All Categories" || selectedCategory === "all") return true;
  return true;
}

export function doesSubcategoryMatch(product: Product, selectedSubcategory: string): boolean {
  if (!selectedSubcategory || selectedSubcategory === "All") return true;
  return true;
}
