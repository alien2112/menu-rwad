import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

const pizzaItems = [
  { id: 1, title: "بيتزا مارغريتا", price: "35 ر.س" },
  { id: 2, title: "بيتزا بيبروني", price: "40 ر.س" },
  { id: 3, title: "بيتزا خضار", price: "38 ر.س" },
  { id: 4, title: "بيتزا مشكلة", price: "45 ر.س" },
  { id: 5, title: "بيتزا دجاج", price: "42 ر.س" },
  { id: 6, title: "بيتزا فور سيزون", price: "48 ر.س" }
];

export default function Pizza() {
  return (
    <MenuDetailTemplate
      title="البيتزا"
      items={pizzaItems}
      pageRoute="/pizza"
    />
  );
}
