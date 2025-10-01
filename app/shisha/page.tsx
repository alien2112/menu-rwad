import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const shishaItems = [
  { id: 1, title: "شيشة فاخرة", price: "80 ر.س" },
  { id: 2, title: "شيشة تفاحتين", price: "70 ر.س" },
  { id: 3, title: "شيشة نكهات خاصة", price: "90 ر.س" },
  { id: 4, title: "شيشة عنب", price: "75 ر.س" },
  { id: 5, title: "شيشة توت", price: "75 ر.س" },
  { id: 6, title: "شيشة مشكلة", price: "85 ر.س" }
];

export default function Shisha() {
  return (
    <MenuDetailTemplate
      title="الشيشة"
      items={shishaItems}
      pageRoute="/shisha"
    />
  );
}
