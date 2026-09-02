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
  bulkNote?: string;
}

export const products: Product[] = [
  {
    id: "premium-cotton-bedsheet",
    name: "Premium Cotton Bedsheet",
    shortDescription:
      "Soft, breathable and durable, ideal for hotel rooms, guesthouses and rental properties.",
    price: "From PKR 2,499",
    image: "/images/bedsheet.png",
    category: "Bedsheets",
    badge: "BESTSELLER",
    gsm: "300",
    material: "100% Premium Cotton",
    variants: ["White", "Cream", "Stone"],
    bulkNote: "Bulk pricing available",
  },
  {
    id: "premium-bath-towel",
    name: "Premium Bath Towel",
    shortDescription:
      "Thick, absorbent cotton towels trusted by hotels and spas for daily guest use.",
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
    shortDescription:
      "Heavy-duty wiping cloths for restaurant kitchens, cleaning crews and housekeeping staff.",
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
    shortDescription:
      "Compact, soft hand towels for washrooms, gyms and guest bathrooms.",
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
export const bestsellerProducts = [
  products[1],
  products[2],
  products[0],
  products[3],
];
