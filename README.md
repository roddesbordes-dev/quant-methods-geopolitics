# Quantitative Methods for Geopolitics and Geoeconomics

A free, self-paced course in six sessions: trusting official numbers, polls and margins of error, dependence and composite indices, regression, policy evaluation (difference-in-differences), and costing a geopolitical shock. Each session runs in the browser on real data, with optional steps in jamovi.

Course designed by Rodolphe Desbordes. Data current to October 2026; sources are listed at the bottom of each session page.

## Structure
- `index.html`: course home; `intro.html`: why this course, learning outcomes, practical skills; `session1.html` … `session6.html`; `certificate.html`: certificate of completion (unlocks when all steps are done; progress is stored in the learner's browser only).
- `src/`: sources. Edit `s<n>.body.html` (text), `s<n>.js` (activities), `s<n>.json` (data), `core.css` / `core.js` (shared), then run `python3 src/build.py` and copy the built pages from `src/site/` to the repository root.

## Data
Data remain under the terms of their original providers (SIPRI, World Bank, UN Comtrade, Eurostat, IMF PortWatch, Pew Research Center, FRED/EIA, Martínez 2022 replication files).
