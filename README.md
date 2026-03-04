# Municipal Assessor — Full-stack scaffold

This workspace contains a static frontend (HTML/CSS/JS) and a minimal Node + Express backend serving the frontend and providing a couple of simple API endpoints.

Quick start (Windows PowerShell):

```powershell
cd "c:\Users\ACER\Documents\Data Management\server"
npm install
npm start
```

Then open http://localhost:3000 in your browser. The frontend is at the project root; the backend serves static files and provides `GET /api/hello` and `GET /api/status`.

Notes:
- Install Node.js (LTS) if you don't have it.
- To enable auto-reload during development, run `npm run dev` inside the `server` folder (requires `nodemon`).

Design guidelines followed by this scaffold:

* **Color theme** – deep blue primary (#1E3A8A) on soft gray background (#F8FAFC) with white cards.
* **Accent colors** – green for released/completed, orange for pending, purple for reports.
* **Typography** – clean sans-serif font Inter via Google Fonts.
* **UI** – soft shadows, 12–16px border radius, smooth hover animations.
* **Icons** – using Lucide for a modern look (FontAwesome remains available for fallback).
* **Layout** – fixed collapsible sidebar, responsive cards, top nav with search & profile.
* **UX** – status badges, smooth transitions, clear visual hierarchy.

Modify `assets/css/styles.css` or `index.html` if you wish to adjust these styles further.
