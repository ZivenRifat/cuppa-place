export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface CoffeeShop {
  name: string;
  address: string;
  rating: number;
  openHours: string;
  images: string[];
  menus: MenuItem[];
}

export const dummyCoffeeShop: CoffeeShop = {
  name: "Renjana Coffee",
  address:
    "Jl. Depot, Kembangan Kidul, Kembangan Tengah, Kota Semarang, Jawa Tengah",
  rating: 5,
  openHours: "SENIN–MINGGU JAM 10.00–02.00",
  images: [
    "/img/renjana1.jpg",
    "/img/renjana2.jpg",
    "/img/renjana3.jpg",
    "/img/renjana4.jpg",
  ],
  menus: [
    { id: 1, name: "Americano", price: 18000, image: "/img/americano.png", category: "Classic Coffee" },
    { id: 2, name: "Long Black", price: 18000, image: "/img/longblack.png", category: "Classic Coffee" },
    { id: 3, name: "Mocha", price: 18000, image: "/img/mocha.png", category: "Classic Coffee" },
    { id: 4, name: "Brulle Latte", price: 18000, image: "/img/brulle.png", category: "Espresso Based" },
    { id: 5, name: "Flavored Coffee", price: 18000, image: "/img/flavored.png", category: "Espresso Based" },
    { id: 6, name: "Maracuja", price: 18000, image: "/img/maracuja.png", category: "Coffee Mocktail" },
    { id: 7, name: "Ubi Ungu", price: 18000, image: "/img/ubiungu.png", category: "Milk Based" },
    { id: 8, name: "Yuzu Tea", price: 18000, image: "/img/yuzu.png", category: "Tea Based" },
  ],
};
