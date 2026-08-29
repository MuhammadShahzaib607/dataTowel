export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  gsm?: string;
  material?: string;
  variants?: string[];
}

export const products: Product[] = [
  {
    id: "cloud-soft-bath",
    name: "Cloud Soft Bath Towel",
    shortDescription: "Impossibly soft. Everyday luxury.",
    price: 48,
    image: "/images/towel-01.jpg",
    category: "Bath Towels",
    badge: "Bestseller",
    gsm: "600",
    material: "100% Premium Cotton",
    variants: ["White", "Beige", "Sand"],
  },
  {
    id: "everyday-hand",
    name: "Everyday Hand Towel",
    shortDescription: "Soft hands, elevated routines.",
    price: 28,
    image: "/images/towel-02.jpg",
    category: "Hand Towels",
    gsm: "500",
    material: "100% Premium Cotton",
    variants: ["White", "Cream", "Stone"],
  },
  {
    id: "spa-collection",
    name: "Spa Collection",
    shortDescription: "Hotel-level luxury, at home.",
    price: 78,
    originalPrice: 95,
    image: "/images/towel-03.jpg",
    category: "Collections",
    badge: "Limited",
    gsm: "700",
    material: "Long-Staple Cotton",
    variants: ["Ivory", "Charcoal"],
  },
  {
    id: "signature-bath-sheet",
    name: "Signature Bath Sheet",
    shortDescription: "Generous size. Maximum comfort.",
    price: 62,
    image: "/images/towel-04.jpg",
    category: "Bath Sheets",
    gsm: "650",
    material: "Egyptian Cotton",
    variants: ["White", "Sand"],
  },
  {
    id: "spa-towel",
    name: "Spa Towel",
    shortDescription: "Wrap yourself in serenity.",
    price: 52,
    image: "/images/towel-01.jpg",
    category: "Bath Towels",
    gsm: "600",
    material: "100% Premium Cotton",
    variants: ["White", "Beige"],
  },
];

export const featuredProducts = products.slice(0, 4);
export const bestsellerProducts = [products[0], products[3], products[1], products[4]];
