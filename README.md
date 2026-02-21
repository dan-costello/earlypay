# EarlyPay

A mortgage payoff and investment comparison calculator. Enter your loan details and extra payment strategy to see exactly how much interest you'll save, when you'll be debt-free, and whether paying down your mortgage early beats investing that money instead.

**Live site:** https://dan-costello.github.io/earlypay/

---

## Features

- **Baseline vs. accelerated amortization** — compares minimum payments against any extra payment strategy
- **Extra payment types**
  - Extra monthly amount
  - Annual lump sum (pick which month)
  - One-off lump sums on specific dates
  - Bi-weekly payment mode (equivalent to one extra payment per year)
- **Investment comparison** — models two strategies over the life of the loan:
  - Invest the extra monthly amount throughout the loan term
  - Make minimum payments → pay off early → invest the full P&I payment afterward
- **Charts** — balance over time, cumulative interest, and investment growth
- **Full amortization tables** — viewable in a modal for both baseline and accelerated schedules

---

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 7](https://vite.dev) — build tooling
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [Recharts](https://recharts.org) — charts
- [Radix UI](https://www.radix-ui.com) — accessible UI primitives
- [date-fns](https://date-fns.org) — date arithmetic

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173.

```bash
npm run build   # production build → dist/
npm run preview # preview the production build locally
```

---

## Deployment

The site deploys automatically to GitHub Pages via the workflow at `.github/workflows/deploy.yml`. Every push to `master` triggers a build and deploys the `dist/` output.

To enable it in a new fork:

1. Go to **Settings → Pages** in your GitHub repo
2. Set **Source** to **GitHub Actions**
3. Push to `master` — the workflow handles the rest
