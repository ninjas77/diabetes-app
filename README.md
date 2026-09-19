# Dijabetički obrok

A phone-friendly web app (in Croatian) that helps a person with diabetes build a meal from ingredients they have at home. Each meal follows the hospital's unit-exchange system.

Data comes from the diet sheets of KBC Sestre milosrdnice, Zavod za endokrinologiju, dijabetes i bolesti metabolizma "Mladen Sekso":
- **Skupine namirnica po jedinicama**: food groups, what one unit contains, and how many grams of each food make one unit ([src/data/foods.ts](src/data/foods.ts), [src/data/groups.ts](src/data/groups.ts))
- **Dijabetička dijeta 1500 / 1700 / 1900 / 2100 / 2700 kcal**: units per group for each of the 6 daily meals ([src/data/plans.ts](src/data/plans.ts))

## How it works

1. **Plan**: pick the daily kcal plan.
2. **Namirnice**: tick the foods you have at home. You can add your own foods, either by entering grams per unit or by working it out from the nutrition label.
3. **Obrok**: pick a meal. The app fills each group's units from your foods and shows the grams. Adjust with ± in half units; the status shows whether the meal matches the plan.

Everything is stored in the browser's `localStorage` on that device only. There is no server.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```
