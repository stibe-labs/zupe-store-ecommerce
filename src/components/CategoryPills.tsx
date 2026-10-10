"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Armchair,
  Headphones,
  Sparkles,
  Leaf,
  Car,
  Gamepad2,
  Tag,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  href: string;
  bgColor: string;
  iconColor: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "all",
    name: "All Categories",
    href: "/products",
    bgColor: "bg-[#EEF2FF]",
    iconColor: "text-[#3B82F6]",
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    id: "tech-gadgets",
    name: "Tech & Gadgets",
    href: "/products?category=Tech+%26+Gadgets",
    bgColor: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
    icon: <Headphones className="w-5 h-5" />,
  },
  {
    id: "home-essentials",
    name: "Home Essentials",
    href: "/products?category=Home+Essentials",
    bgColor: "bg-[#FEEBEA]",
    iconColor: "text-[#E0533C]",
    icon: <Armchair className="w-5 h-5" />,
  },
  {
    id: "personal-care",
    name: "Personal Care",
    href: "/products?category=Personal+Care",
    bgColor: "bg-[#F3E8FF]",
    iconColor: "text-[#9333EA]",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "auto-essentials",
    name: "Auto Essentials",
    href: "/products?category=Auto+Essentials",
    bgColor: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    icon: <Car className="w-5 h-5" />,
  },
  {
    id: "fitness-wellness",
    name: "Fitness & Wellness",
    href: "/products?category=Fitness+%26+Wellness",
    bgColor: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    id: "kids-fun",
    name: "Kids & Fun",
    href: "/products?category=Kids+%26+Fun",
    bgColor: "bg-[#FCE7F3]",
    iconColor: "text-[#DB2777]",
    icon: <Gamepad2 className="w-5 h-5" />,
  },
  {
    id: "deals-offers",
    name: "Deals & Offers",
    href: "/products?category=Deals+%26+Offers",
    bgColor: "bg-[#FFE4E6]",
    iconColor: "text-[#E11D48]",
    icon: <Tag className="w-5 h-5" />,
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Armchair: <Armchair className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  Tag: <Tag className="w-5 h-5" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5" />,
};

function getIconForCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("car") || lower.includes("auto")) return <Car className="w-5 h-5" />;
  if (lower.includes("gadget") || lower.includes("audio") || lower.includes("tech")) return <Headphones className="w-5 h-5" />;
  if (lower.includes("health") || lower.includes("plant") || lower.includes("wellness") || lower.includes("fitness")) return <Leaf className="w-5 h-5" />;
  if (lower.includes("home") || lower.includes("living") || lower.includes("essential")) return <Armchair className="w-5 h-5" />;
  if (lower.includes("care") || lower.includes("beauty")) return <Sparkles className="w-5 h-5" />;
  if (lower.includes("kid") || lower.includes("fun") || lower.includes("toy") || lower.includes("game")) return <Gamepad2 className="w-5 h-5" />;
  if (lower.includes("deal") || lower.includes("offer") || lower.includes("sale")) return <Tag className="w-5 h-5" />;
  return <LayoutGrid className="w-5 h-5" />;
}

export function CategoryPills() {
  const [categoryItems, setCategoryItems] = React.useState<CategoryItem[]>(CATEGORIES);

  React.useEffect(() => {
    fetch("/api/content/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const dynamicPills = data.categories
            .filter((c: any) => c.active !== false && c.showInPills !== false)
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              href: `/products?category=${encodeURIComponent(c.slug || c.name)}`,
              bgColor: c.bgColor || "bg-orange-50",
              iconColor: c.iconColor || "text-[#FF7A00]",
              icon: c.customIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.customIcon}
                  alt={c.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full"
                />
              ) : (
                ICON_MAP[c.icon] || getIconForCategory(c.name)
              ),
            }));

          setCategoryItems([
            CATEGORIES[0], // "All Categories"
            ...dynamicPills,
          ]);
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic category pills:", err));
  }, []);

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 px-1">
        {categoryItems.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="flex flex-col items-center flex-shrink-0 group text-center min-w-[72px] sm:min-w-[84px]"
          >
            {/* Pastel Circle Container */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${cat.bgColor} ${cat.iconColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md mb-2 overflow-hidden`}
            >
              {cat.icon}
            </div>
            {/* Label */}
            <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-[#FF7A00] transition-colors leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
