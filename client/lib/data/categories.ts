export interface SubCategoryOption {
  label: string;
  value: string;
}

export interface CategoryConfig {
  category: string;
  subCategories: SubCategoryOption[];
}

export const PRODUCT_CATEGORIES: CategoryConfig[] = [
  {
    category: "Towels",
    subCategories: [
      { label: "Bath Towel", value: "Bath Towel" },
      { label: "Hand Towel", value: "Hand Towel" },
      { label: "Face Towel", value: "Face Towel" },
      { label: "Cleaning Towel", value: "Cleaning Towel" },
      { label: "Kitchen Towel", value: "Kitchen Towel" },
      { label: "Household Towel", value: "Household Towel" },
      { label: "Wiping Towel", value: "Wiping Towel" },
    ],
  },
  {
    category: "Bedsheets",
    subCategories: [
      { label: "Single Bedsheet", value: "Single Bedsheet" },
      { label: "Double Bedsheet", value: "Double Bedsheet" },
      { label: "King Size Bedsheet", value: "King Size Bedsheet" },
      { label: "Queen Size Bedsheet", value: "Queen Size Bedsheet" },
    ],
  },
];

export const CATEGORY_NAMES = PRODUCT_CATEGORIES.map((c) => c.category);

export function getSubCategoriesForCategory(
  category: string
): SubCategoryOption[] {
  const found = PRODUCT_CATEGORIES.find((c) => c.category === category);
  return found?.subCategories ?? [];
}

// Available product sizes — selectable chips, not free-text
export const AVAILABLE_SIZES = [
  { label: "20x40", value: "20x40" },
  { label: "27x44", value: "27x44" },
  { label: "30x60", value: "30x60" },
  { label: "12x12", value: "12x12" },
  { label: "8x10", value: "8x10" },
];
