export interface Product {
  id: string;
  name: string;
  price: string;
  emoji: string;
  accentColor: string;
  bgColor: string;
  tag?: string;
}

export interface ShelfCategory {
  id: string;
  label: string;
  sublabel: string;
  products: Product[];
}

export const categories: ShelfCategory[] = [
  {
    id: "new-arrivals",
    label: "New Arrivals",
    sublabel: "Just dropped",
    products: [
      { id: "na1", name: "Cherry Blossom Set", price: "$14.99", emoji: "🌸", accentColor: "#F4A7B9", bgColor: "#FFF0F4", tag: "NEW" },
      { id: "na2", name: "Nude Glam Press-Ons", price: "$12.99", emoji: "💅", accentColor: "#D4A574", bgColor: "#FDF5EC", tag: "NEW" },
      { id: "na3", name: "Midnight Garden", price: "$16.99", emoji: "🌿", accentColor: "#6B8F71", bgColor: "#F0F5F1", tag: "NEW" },
      { id: "na4", name: "Rose Gold Halo", price: "$18.99", emoji: "✨", accentColor: "#C9A08A", bgColor: "#FBF2EE", tag: "NEW" },
    ],
  },
  {
    id: "trending",
    label: "Trending",
    sublabel: "Everyone loves",
    products: [
      { id: "tr1", name: "French Tip Luxe", price: "$13.99", emoji: "🤍", accentColor: "#B8D4E0", bgColor: "#EFF7FB", tag: "🔥" },
      { id: "tr2", name: "Strawberry Swirl", price: "$15.99", emoji: "🍓", accentColor: "#E8727A", bgColor: "#FEF0F0", tag: "🔥" },
      { id: "tr3", name: "Lavender Dreams", price: "$14.99", emoji: "💜", accentColor: "#B39DDB", bgColor: "#F5F0FA", tag: "🔥" },
      { id: "tr4", name: "Coastal Chrome", price: "$19.99", emoji: "🐚", accentColor: "#8ECAE6", bgColor: "#EEF8FD", tag: "🔥" },
    ],
  },
  {
    id: "top-rated",
    label: "Top Rated",
    sublabel: "Customer favourites",
    products: [
      { id: "tp1", name: "Ballet Core Pink", price: "$12.99", emoji: "🩰", accentColor: "#F9C4D0", bgColor: "#FFF5F7", tag: "⭐" },
      { id: "tp2", name: "Espresso Ombre", price: "$17.99", emoji: "☕", accentColor: "#8B5E3C", bgColor: "#F9F3EE", tag: "⭐" },
      { id: "tp3", name: "Icy White Almond", price: "$13.99", emoji: "❄️", accentColor: "#C9E4F0", bgColor: "#F0F8FC", tag: "⭐" },
      { id: "tp4", name: "Velvet Plum", price: "$16.99", emoji: "🍇", accentColor: "#7B4F6E", bgColor: "#F5EFF4", tag: "⭐" },
    ],
  },
];
