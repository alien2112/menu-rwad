import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const sandwichItems = [
  { id: 1, title: "برجر كلاسيك", price: "30 ر.س" },
  { id: 2, title: "برجر دجاج", price: "28 ر.س" },
  { id: 3, title: "ساندوتش فاهيتا", price: "25 ر.س" },
  { id: 4, title: "ساندوتش كفتة", price: "22 ر.س" },
  { id: 5, title: "برجر مشروم", price: "32 ر.س" },
  { id: 6, title: "ساندوتش تونة", price: "20 ر.س" }
];

export default function Sandwiches() {
  return (
    <MenuDetailTemplate
      title="السندوتش و البرجر"
      items={sandwichItems}
      pageRoute="/sandwiches"
    />
  );
}
