import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const juiceItems = [
  { id: 1, title: "عصير برتقال", price: "18 ر.س" },
  { id: 2, title: "عصير ليمون", price: "15 ر.س" },
  { id: 3, title: "عصير مانجو", price: "22 ر.س" },
  { id: 4, title: "عصير فراولة", price: "20 ر.س" },
  { id: 5, title: "عصير أفوكادو", price: "25 ر.س" },
  { id: 6, title: "عصير مشكل", price: "24 ر.س" }
];

export default function NaturalJuices() {
  return (
    <MenuDetailTemplate
      title="العصائر الطبيعية"
      items={juiceItems}
      pageRoute="/natural-juices"
    />
  );
}
