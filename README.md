# Dijabetički obrok

A phone-friendly web app (in Croatian) that helps a person with diabetes build a meal from ingredients they have at home. Each meal follows the hospital's unit-exchange system.

Data comes from the diet sheets of KBC Sestre milosrdnice, Zavod za endokrinologiju, dijabetes i bolesti metabolizma "Mladen Sekso":
- **Skupine namirnica po jedinicama**: food groups, what one unit contains, and how many grams of each food make one unit ([src/data/foods.ts](src/data/foods.ts), [src/data/groups.ts](src/data/groups.ts))
- **Dijabetička dijeta 1500 / 1700 / 1900 / 2100 / 2700 kcal**: units per group for each of the 6 daily meals ([src/data/plans.ts](src/data/plans.ts))

3-meal variants (zajutrak, ručak, večera) of the 1900 and 2100 kcal plans come from PLIVAzdravlje (source: Hrvatsko društvo za dijabetes):
- https://www.plivazdravlje.hr/dijabeticka-dijeta/1900kcal-3obroka.html
- https://www.plivazdravlje.hr/dijabeticka-dijeta/2100kcal-3obroka.html

## How it works

1. **Plan**: pick the daily kcal plan (and 6 or 3 meals, where both exist) and whether you want the **whole day** or **one meal** (and which).
2. **Kod kuće**: tick the foods you have at home. You can add your own foods, either by entering grams per unit or by working it out from the nutrition label.
3. **Obrok**: the app builds the meal or the whole 6-meal day from your foods:
   - pairing rules ([src/lib/pairing.ts](src/lib/pairing.ts)) keep foods sensible for the meal: bread and spreads for cold meals, rice and potatoes for cooked ones, no spread without bread
   - the day planner ([src/lib/day.ts](src/lib/day.ts)) avoids repeating foods across meals; each meal can be swapped on its own
   - "Prilagodi" lets you fine-tune amounts in half units

Everything is stored in the browser's `localStorage` on that device only. There is no server.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```
