# Quantitative Methods for Geopolitics and Geoeconomics

A free, self-paced course in six sessions, in English and French: trusting official numbers, polls and margins of error, dependence and composite indices, regression, policy evaluation (difference-in-differences), and costing a geopolitical shock. Each session runs in the browser on real data, with optional steps in jamovi.

Course designed by Rodolphe Desbordes. Data current to October 2026; sources are listed at the bottom of each session page.

## Structure
- English at the root, French in `fr/` (same file names): `index.html`, `intro.html`, `session1.html` … `session6.html`, `glossary.html`, `certificate.html`.
- Glossary: terms are underlined in the sessions and defined on hover or tap; the full list is on `glossary.html`. Edit `src/glossary.js` (English and French in one file).
- Feedback: every page links to a new GitHub issue on this repository (keep Issues enabled in Settings). To use a form instead, change `FEEDBACK_URL` near the top of `src/core.js`.
- `src/`: sources. English in `src/`, French in `src/fr/`. Edit, run `python3 src/build.py`, then copy `src/site/` (including `src/site/fr/`) to the repository root.

## Progress and certificate
Learners' answers are stored in their own browser only, shared between the English and French pages. The certificate unlocks when every step of the six sessions is done; it is a self-assessed certificate of completion, not of graded assessment.

## Data
Data remain under the terms of their original providers (SIPRI, World Bank, UN Comtrade, Eurostat, IMF PortWatch, Pew Research Center, FRED/EIA, Martínez 2022 replication files).
