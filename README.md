# Engineering PDF Markup — MVP

A browser-based engineering PDF review/markup prototype inspired by the workflow of professional plan-review tools.

## Current MVP features
- Load local PDF
- PDF.js rendering
- Page navigation
- Zoom
- Freehand markup
- Line markup
- Rectangle markup
- Text notes
- Distance measurement
- User-defined scale conversion
- Undo / clear page
- Export markup JSON
- Save markup project to FastAPI backend

## Important limitation
The current MVP stores annotations separately from the original PDF. It does **not yet burn annotations into a new PDF**.

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Run backend

Python 3.11+ recommended.

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Scale calibration in this prototype
`Scale` means real-world drawing units per rendered screen pixel.

Example:
- if 100 rendered pixels correspond to 20 ft,
- enter 0.2 ft/pixel.

A production version should replace this with a two-click calibration workflow:
1. click Point A
2. click Point B
3. enter the known distance
4. calculate and store page/view calibration automatically

## Recommended next modules
1. Two-click scale calibration
2. Polyline and polygon measurements
3. Area/perimeter takeoff
4. Count tool
5. Measurement list / quantity table
6. Layer and markup visibility
7. User accounts and cloud storage
8. PDF annotation flattening/export
9. Stamp/signature placement
10. Drawing comparison / overlay
11. OCR and searchable scanned plans
12. Real-time collaboration
13. Engineering toolsets and reusable symbols
14. Calibrated page-scale presets
15. Audit trail / revision history

## Production note
This is a starter architecture, not a production-secure SaaS. Add authentication, object storage, database persistence, authorization, malware scanning, rate limiting, backups, and tests before production deployment.
