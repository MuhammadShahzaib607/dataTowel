export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  price: string;
  originalPrice?: string;
  image: string;
  category: string;
  badge?: string;
  gsm?: string;
  material?: string;
  variants?: string[];
}

export const products: Product[] = [
  {
    id: "premium-cotton-bedsheet",
    name: "Premium Cotton Bedsheet",
    shortDescription: "Soft, breathable and beautifully crafted for everyday comfort.",
    price: "From PKR 2,499",
    image: "/images/bedsheet.png",
    category: "Bedsheets",
    badge: "BESTSELLER",
    gsm: "300",
    material: "100% Premium Cotton",
    variants: ["White", "Cream", "Stone"],
  },
  {
    id: "premium-bath-towel",
    name: "Premium Bath Towel",
    shortDescription: "Ultra-soft, absorbent cotton designed for everyday luxury.",
    price: "From PKR 899",
    image: "/images/bath-towel.png",
    category: "Bath Towels",
    badge: "SOFT & ABSORBENT",
    gsm: "600",
    material: "100% Premium Cotton",
    variants: ["White", "Beige", "Sand"],
  },
  {
    id: "cleaning-utility-towels",
    name: "Cleaning & Utility Towels",
    shortDescription: "Durable, absorbent towels for everyday cleaning and professional use.",
    price: "From PKR 399",
    image: "/images/cleaning-towels.png",
    category: "Utility Towels",
    badge: "BULK SUPPLY",
    gsm: "400",
    material: "100% Premium Cotton",
    variants: ["White", "Blue", "Green"],
  },
  {
    id: "luxury-hand-towels",
    name: "Luxury Hand Towels",
    shortDescription: "Soft, refined and perfectly sized for everyday essentials.",
    price: "From PKR 599",
    image: "/images/hand-towels.png",
    category: "Hand Towels",
    badge: "EVERYDAY ESSENTIAL",
    gsm: "500",
    material: "100% Premium Cotton",
    variants: ["White", "Cream", "Stone"],
  },
];

export const featuredProducts = products;
export const bestsellerProducts = products;
