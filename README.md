# MindVault Coach

Sales performance and training platform for door-to-door teams.

## Features

- **Training Modules** - Interactive courses covering the full sales process
- **Objection Library** - Searchable rebuttals with proven scripts and best practices
- **Field Activity Logs** - Track daily performance and earn XP
- **Practice Lab** - AI roleplay scenarios with coach review workflow
- **Gamification** - XP, levels, streaks, and achievements to keep reps engaged

## Tech Stack

- React 18 + Vite
- Tailwind CSS + shadcn/ui components
- localStorage-based data (no backend required for MVP)
- Deployable to GitHub Pages, VPS, or any static host

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`. Deploy as static files.

## Deployment

### GitHub Pages
Push to `main` branch. The GitHub Actions workflow handles build and deploy automatically.

### Custom Domain (VPS)
Build and serve the `dist/` folder via nginx. For subpath deployment (e.g., `/coach/`), update `base` in `vite.config.js`.

## Branding

Default branding is "MindVault". To white-label for a client, edit `src/lib/branding.js`.

## License

Proprietary - MindVault Studio
