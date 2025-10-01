import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const hotCoffeeItems = [
  { id: 1, title: "إسبريسو", price: "15 ر.س" },
  { id: 2, title: "كابتشينو", price: "20 ر.س" },
  { id: 3, title: "لاتيه", price: "22 ر.س" },
  { id: 4, title: "أمريكانو", price: "18 ر.س" },
  { id: 5, title: "موكا", price: "25 ر.س" },
  { id: 6, title: "تركي", price: "12 ر.س" }
];

export default function HotCoffee() {
  return (
    <MenuDetailTemplate
      title="قهوه ساخنة"
      items={hotCoffeeItems}
      pageRoute="/hot-coffee"
    />
  );
}
