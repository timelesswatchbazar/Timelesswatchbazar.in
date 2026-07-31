export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  actualPrice?: number;
  category: string;
  image: string;
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
};
