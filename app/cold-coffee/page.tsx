import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const coldCoffeeItems = [
  { id: 1, title: "آيس لاتيه", price: "22 ر.س" },
  { id: 2, title: "آيس أمريكانو", price: "18 ر.س" },
  { id: 3, title: "فرابتشينو", price: "25 ر.س" },
  { id: 4, title: "كولد برو", price: "24 ر.س" },
  { id: 5, title: "موكا مثلج", price: "26 ر.س" },
  { id: 6, title: "كراميل آيس", price: "28 ر.س" }
];

export default function ColdCoffee() {
  return (
    <MenuDetailTemplate
      title="قهوة بارده"
      items={coldCoffeeItems}
      pageRoute="/cold-coffee"
    />
  );
}
