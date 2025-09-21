This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
## RSI Analytics Dashboard (UI Modernization)

Modern responsive dashboard for real-time RSI & price analytics.

### Features
* Real-time WebSocket updates (live status indicator)
* Price & RSI charts (Recharts) with adaptive theming
* Dark / Light / System theme via `next-themes`
* Responsive card-based layout with design tokens
* Accessible semantic structure & focus styles
* Compact token selector with formatted addresses

### Tech Stack
Next.js 15 (App Router)  
React 19  
Recharts  
next-themes (theme switching)  
lucide-react (icons)

### Development
```
npm install
npm run dev
```
Open http://localhost:3000

### File Highlights
* `src/app/layout.tsx` – App shell, header, theming provider
* `src/app/page.tsx` – Dashboard composition and data wiring
* `src/components/*` – Modular UI components
* `src/app/globals.css` – Design tokens (CSS variables) & base component classes

### Theming
Uses CSS variables for color system. Dark mode toggled by adding `.dark` class to `<html>` (handled by `next-themes`). Extend palette by overriding `--primary`, etc., in `globals.css`.

### Adding Components
Use existing `.card`, `.btn`, `.input`, `.badge` classes or Tailwind utilities. Prefer semantic elements and keep layouts mobile-first.

### Accessibility
* Focus states preserved
* Color contrast meets WCAG AA for primary actions
* Icons paired with text or have `aria-label`

### Future Enhancements
* Add multi-token comparison view
* Persist selected theme & token in local storage (theme already handled)
* Add loading skeletons for charts

---
Generated from Next.js starter and refactored for a professional analytics UI.
