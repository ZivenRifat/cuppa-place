export interface Review {
  id: number;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MenuItem {
  name: string;
  image: string;
  price: string;
}

export interface CoffeeShop {
  slug: string;
  name: string;
  about: string;
  rating: number;
  address: string;
  hours: string;
  maps: string;
  images: string[];
  menus: Record<string, MenuItem[]>;
  reviews: Review[];
}
