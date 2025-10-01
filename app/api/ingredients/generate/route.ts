import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ingredient, { IIngredient } from '@/lib/models/Ingredient';
import MenuItem, { IMenuItem } from '@/lib/models/MenuItem';

const ingredientPools: Record<string, string[]> = {
  coffee: ['Espresso', 'Arabica Beans', 'Milk'],
  tea: ['Black Tea', 'Green Tea', 'Mint'],
  juice: ['Orange', 'Lemon', 'Mint'],
  cocktail: ['Strawberry', 'Banana', 'Mango'],
  dessert: ['Chocolate', 'Vanilla', 'Strawberry'],
  pizza: ['Mozzarella', 'Tomato Sauce', 'Olives'],
  sandwich: ['Lettuce', 'Tomato', 'Cheese'],
  manakish: ['Zaatar', 'Cheese', 'Olive Oil'],
  shisha: ['Apple', 'Mint', 'Grape'],
  default: ['Sugar', 'Water', 'Ice'],
};

function pickPool(nameEn?: string, name?: string): string[] {
  const text = `${(nameEn || '').toLowerCase()} ${(name || '').toLowerCase()}`;
  if (/(espresso|latte|coffee|mocha)/.test(text)) return ingredientPools.coffee;
  if (/(tea|chai)/.test(text)) return ingredientPools.tea;
  if (/(juice|orange|lemon|mint)/.test(text)) return ingredientPools.juice;
  if (/(cocktail|smoothie)/.test(text)) return ingredientPools.cocktail;
  if (/(cake|dessert|ice cream|brownie)/.test(text)) return ingredientPools.dessert;
  if (/(pizza)/.test(text)) return ingredientPools.pizza;
  if (/(sandwich|burger|wrap)/.test(text)) return ingredientPools.sandwich;
  if (/(manakish|manaeesh|zaatar|cheese)/.test(text)) return ingredientPools.manakish;
  if (/(shisha|hookah)/.test(text)) return ingredientPools.shisha;
  return ingredientPools.default;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const items: IMenuItem[] = await MenuItem.find({});
    const nameToIngredientId = new Map<string, string>();

    const upsertIngredient = async (name: string, unit = 'g'): Promise<string> => {
      const key = name.toLowerCase();
      if (nameToIngredientId.has(key)) return nameToIngredientId.get(key)!;
      const existing = await Ingredient.findOne({ name });
      if (existing) {
        nameToIngredientId.set(key, existing._id as string);
        return existing._id as string;
      }
      const created = await Ingredient.create({
        name,
        unit,
        defaultPortion: 1,
        pricePerUnit: 0,
        status: 'active',
      } as Partial<IIngredient>);
      nameToIngredientId.set(key, created._id as string);
      return created._id as string;
    };

    for (const item of items) {
      const pool = pickPool(item.nameEn, item.name);
      const unique = Array.from(new Set(pool)).slice(0, 3);
      const ingredientIds: string[] = [];
      for (const name of unique) {
        const id = await upsertIngredient(name);
        ingredientIds.push(id);
      }
      item.ingredients = ingredientIds.map((id) => ({ ingredientId: id, portion: 1, required: true }));
      await item.save();
    }

    return NextResponse.json({ success: true, updated: items.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


