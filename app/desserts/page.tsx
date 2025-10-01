import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const dessertItems = [
  { id: 1, title: "تشيز كيك", price: "25 ر.س" },
  { id: 2, title: "براونيز", price: "20 ر.س" },
  { id: 3, title: "كيك شوكولاتة", price: "22 ر.س" },
  { id: 4, title: "آيس كريم", price: "18 ر.س" },
  { id: 5, title: "تيراميسو", price: "28 ر.س" },
  { id: 6, title: "كريم كراميل", price: "15 ر.س" }
];

export default function Desserts() {
  return (
    <MenuDetailTemplate
      title="الحلا"
      items={dessertItems}
      pageRoute="/desserts"
    />
  );
}
