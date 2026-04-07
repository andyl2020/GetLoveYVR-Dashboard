# GetLoveYVR Dashboard

A sleek React dashboard for GetLoveYVR event planning, marketing coordination, and calendar-driven execution.

## Highlights

- Month calendar view for milestones and event days
- Operations board with quick milestone toggles
- Marketing workflow with owner and status filters
- GitHub Pages deployment via GitHub Actions

## Project Notes

- The original source file provided by the user was moved into `src/legacy/getloveyvr-dashboard.jsx`.
- The production app lives in `src/` and is built with Vite + React.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Firebase Sync

- Copy `.env.example` to `.env` when your Firebase project is ready.
- Follow the step-by-step setup guide in `FIREBASE_SETUP.md`.
- The dashboard is wired for public read access plus editor-only writes via Firebase Google sign-in.
