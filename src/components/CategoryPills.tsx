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
  UtensilsCrossed,
  PenTool,
  Footprints,
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
    id: "home-living",
    name: "Home & Living",
    href: "/products?category=Home+%26+Living",
    bgColor: "bg-[#FEEBEA]",
    iconColor: "text-[#E0533C]",
    icon: <Armchair className="w-5 h-5" />,
  },
  {
    id: "gadgets",
    name: "Gadgets",
    href: "/products?category=Gadgets",
    bgColor: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
    icon: <Headphones className="w-5 h-5" />,
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
    id: "health-wellness",
    name: "Health & Wellness",
    href: "/products?category=Health+%26+Wellness",
    bgColor: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    id: "car-accessories",
    name: "Car Accessories",
    href: "/products?category=Car+Accessories",
    bgColor: "bg-[#FFE4E6]",
    iconColor: "text-[#E11D48]",
    icon: <Car className="w-5 h-5" />,
  },
  {
    id: "kitchen-essentials",
    name: "Kitchen Essentials",
    href: "/products?category=Kitchen+Essentials",
    bgColor: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  {
    id: "stationery",
    name: "Stationery",
    href: "/products?category=Stationery",
    bgColor: "bg-[#DBEAFE]",
    iconColor: "text-[#2563EB]",
    icon: <PenTool className="w-5 h-5" />,
  },
  {
    id: "pet-essentials",
    name: "Pet Essentials",
    href: "/products?category=Pet+Essentials",
    bgColor: "bg-[#FCE7F3]",
    iconColor: "text-[#DB2777]",
    icon: <Footprints className="w-5 h-5" />,
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Armchair: <Armchair className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  PenTool: <PenTool className="w-5 h-5" />,
  Footprints: <Footprints className="w-5 h-5" />,
  Tag: <LayoutGrid className="w-5 h-5" />,
};

function getIconForCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("car") || lower.includes("auto")) return <Car className="w-5 h-5" />;
  if (lower.includes("gadget") || lower.includes("audio") || lower.includes("tech")) return <Headphones className="w-5 h-5" />;
  if (lower.includes("health") || lower.includes("plant") || lower.includes("wellness")) return <Leaf className="w-5 h-5" />;
  if (lower.includes("home") || lower.includes("living") || lower.includes("decor")) return <Armchair className="w-5 h-5" />;
  if (lower.includes("care") || lower.includes("beauty")) return <Sparkles className="w-5 h-5" />;
  if (lower.includes("kitchen") || lower.includes("food")) return <UtensilsCrossed className="w-5 h-5" />;
  if (lower.includes("stationery") || lower.includes("office")) return <PenTool className="w-5 h-5" />;
  if (lower.includes("pet") || lower.includes("dog") || lower.includes("cat")) return <Footprints className="w-5 h-5" />;
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
              iconColor: c.iconColor || "text-[#FA521C]",
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
            <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-[#FA521C] transition-colors leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
