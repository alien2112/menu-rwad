"use client";

import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const teaItems = [
  { id: 1, title: "شاي أحمر", price: "15 ر.س" },
  { id: 2, title: "شاي أخضر", price: "18 ر.س" },
  { id: 3, title: "شاي بالنعناع", price: "20 ر.س" },
  { id: 4, title: "شاي بالحليب", price: "22 ر.س" },
  { id: 5, title: "شاي تركي", price: "25 ر.س" },
  { id: 6, title: "شاي كشري", price: "20 ر.س" }
];

export default function Tea() {
  return (
    <MenuDetailTemplate
      title="الشاي"
      items={teaItems}
      pageRoute="/tea"
    />
  );
}
