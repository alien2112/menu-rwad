import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const manakishItems = [
  { id: 1, title: "منقوشة زعتر", price: "12 ر.س" },
  { id: 2, title: "منقوشة جبنة", price: "15 ر.س" },
  { id: 3, title: "منقوشة لحمة", price: "18 ر.س" },
  { id: 4, title: "فطيرة سبانخ", price: "14 ر.س" },
  { id: 5, title: "فطيرة جبنة", price: "16 ر.س" },
  { id: 6, title: "منقوشة مشكلة", price: "20 ر.س" }
];

export default function Manakish() {
  return (
    <MenuDetailTemplate
      title="المناقيش و الفطائر"
      items={manakishItems}
      pageRoute="/manakish"
    />
  );
}
