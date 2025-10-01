import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const cocktailItems = [
  { id: 1, title: "موهيتو كلاسيك", price: "28 ر.س" },
  { id: 2, title: "موهيتو فراولة", price: "30 ر.س" },
  { id: 3, title: "كوكتيل استوائي", price: "32 ر.س" },
  { id: 4, title: "كوكتيل الفواكه", price: "30 ر.س" },
  { id: 5, title: "موهيتو بطيخ", price: "30 ر.س" },
  { id: 6, title: "كوكتيل الباشن فروت", price: "35 ر.س" }
];

export default function Cocktails() {
  return (
    <MenuDetailTemplate
      title="الكوكتيل و الموهيتو"
      items={cocktailItems}
      pageRoute="/cocktails"
    />
  );
}
