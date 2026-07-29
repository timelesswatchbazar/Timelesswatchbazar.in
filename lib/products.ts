import type { Category, Product } from "./types";

export const categories: Category[] = [
  {
    slug: "mens-watches",
    name: "Men's Watches",
    description: "Classic and contemporary timepieces for men.",
  },
  {
    slug: "womens-watches",
    name: "Women's Watches",
    description: "Elegant watches designed for every occasion.",
  },
  {
    slug: "smart-watches",
    name: "Smart Watches",
    description: "Connected wearables for modern living.",
  },
  {
    slug: "luxury-collection",
    name: "Luxury Collection",
    description: "Premium watches with refined craftsmanship.",
  },
  {
    slug: "sports-dive",
    name: "Sports & Dive",
    description: "Durable watches built for active lifestyles.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Straps, cases, and watch care essentials.",
  },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "aurora-chronograph-black",
    name: "Aurora Chronograph Black",
    price: 299,
    category: "mens-watches",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    description:
      "A sleek black chronograph with stainless steel case, luminous hands, and a precision quartz movement. Water resistant to 50m.",
    isNew: true,
  },
  {
    id: "2",
    slug: "luna-pearl-rose-gold",
    name: "Luna Pearl Rose Gold",
    price: 349,
    category: "womens-watches",
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80",
    description:
      "Rose gold-toned case with a pearl-effect dial and slim leather strap. Elegant everyday luxury for her.",
    isNew: true,
  },
  {
    id: "3",
    slug: "pulse-pro-smartwatch",
    name: "Pulse Pro Smartwatch",
    price: 449,
    category: "smart-watches",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    description:
      "Fitness tracking, heart-rate monitoring, notifications, and a bright AMOLED display with 7-day battery life.",
    isNew: true,
  },
  {
    id: "4",
    slug: "heritage-automatic-silver",
    name: "Heritage Automatic Silver",
    price: 899,
    category: "luxury-collection",
    image:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80",
    description:
      "Automatic mechanical movement with exhibition caseback, sapphire crystal, and polished silver bracelet.",
    isNew: true,
  },
  {
    id: "5",
    slug: "tide-diver-blue",
    name: "Tide Diver Blue",
    price: 379,
    category: "sports-dive",
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80",
    description:
      "Professional dive watch with unidirectional bezel, screw-down crown, and 200m water resistance.",
  },
  {
    id: "6",
    slug: "noir-minimal-mesh",
    name: "Noir Minimal Mesh",
    price: 189,
    category: "mens-watches",
    image:
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=800&q=80",
    description:
      "Ultra-thin black dial with milanese mesh bracelet. Minimal design that pairs with any outfit.",
  },
  {
    id: "7",
    slug: "soleil-diamond-accent",
    name: "Soleil Diamond Accent",
    price: 529,
    category: "womens-watches",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
    description:
      "Sunray dial with crystal hour markers and a refined gold-tone bracelet for special occasions.",
  },
  {
    id: "8",
    slug: "apex-sport-gps",
    name: "Apex Sport GPS",
    price: 599,
    category: "smart-watches",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
    description:
      "Built-in GPS, multi-sport modes, SpO2 sensor, and rugged design for outdoor adventures.",
  },
  {
    id: "9",
    slug: "imperial-gold-tour",
    name: "Imperial Gold Tour",
    price: 1299,
    category: "luxury-collection",
    image:
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=800&q=80",
    description:
      "Gold-plated luxury dress watch with guilloché dial and genuine alligator-pattern leather strap.",
  },
  {
    id: "10",
    slug: "ranger-field-khaki",
    name: "Ranger Field Khaki",
    price: 249,
    category: "sports-dive",
    image:
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=800&q=80",
    description:
      "Military-inspired field watch with luminous numerals, canvas strap, and shock-resistant case.",
  },
  {
    id: "11",
    slug: "velvet-rose-leather",
    name: "Velvet Rose Leather",
    price: 219,
    category: "womens-watches",
    image:
      "https://images.unsplash.com/photo-1548169874-53e85f753f1e?auto=format&fit=crop&w=800&q=80",
    description:
      "Soft rose dial paired with genuine leather strap. Lightweight comfort for daily wear.",
  },
  {
    id: "12",
    slug: "steel-commander",
    name: "Steel Commander",
    price: 329,
    category: "mens-watches",
    image:
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=800&q=80",
    description:
      "Bold stainless steel chronograph with date window and tachymeter bezel for a commanding look.",
  },
  {
    id: "13",
    slug: "connect-lite-black",
    name: "Connect Lite Black",
    price: 199,
    category: "smart-watches",
    image:
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=800&q=80",
    description:
      "Affordable smartwatch with step tracking, sleep analysis, and smartphone notifications.",
  },
  {
    id: "14",
    slug: "prestige-moonphase",
    name: "Prestige Moonphase",
    price: 1599,
    category: "luxury-collection",
    image:
      "https://images.unsplash.com/photo-1609587312208-cea54be969e7?auto=format&fit=crop&w=800&q=80",
    description:
      "Moonphase complication with sapphire crystal and hand-finished details for true connoisseurs.",
  },
  {
    id: "15",
    slug: "ocean-gmt-ceramic",
    name: "Ocean GMT Ceramic",
    price: 679,
    category: "sports-dive",
    image:
      "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&w=800&q=80",
    description:
      "Dual-timezone GMT with ceramic bezel insert. Perfect for frequent travelers and divers.",
  },
  {
    id: "16",
    slug: "leather-strap-set-brown",
    name: "Leather Strap Set Brown",
    price: 79,
    category: "accessories",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80",
    description:
      "Premium brown leather quick-release straps. Fits 20mm and 22mm lug widths.",
  },
  {
    id: "17",
    slug: "watch-winder-double",
    name: "Watch Winder Double",
    price: 249,
    category: "accessories",
    image:
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=800&q=80",
    description:
      "Quiet dual-watch winder with adjustable rotations and soft pillow holders for automatic watches.",
  },
  {
    id: "18",
    slug: "travel-case-velvet",
    name: "Travel Case Velvet",
    price: 59,
    category: "accessories",
    image:
      "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?auto=format&fit=crop&w=800&q=80",
    description:
      "Compact velvet-lined travel case for up to 4 watches. Zippered and protective for journeys.",
  },
  {
    id: "19",
    slug: "classic-dress-navy",
    name: "Classic Dress Navy",
    price: 279,
    category: "mens-watches",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    description:
      "Navy dial dress watch with gold indexes and genuine leather strap. Boardroom ready.",
  },
  {
    id: "20",
    slug: "crystal-bracelet-silver",
    name: "Crystal Bracelet Silver",
    price: 259,
    category: "womens-watches",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
    description:
      "Sparkling crystal-set bezel with silver bracelet. A statement piece for evenings out.",
  },
];

export function formatPrice(price: number) {
  return `AED ${price}`;
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((p) => p.category === categorySlug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getNewArrivals() {
  return products.filter((p) => p.isNew);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      categories
        .find((c) => c.slug === p.category)
        ?.name.toLowerCase()
        .includes(q),
  );
}
