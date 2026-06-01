🗺️ Border Crossing Activity Map
POC-39 · Real Rails Intelligence Library · Data & Intelligence Rail
A production-style full-stack intelligence dashboard for monitoring global border crossing activity — built as part of the Real Rails Internship Program at Boston Institute of Analytics.

📸 Preview

Live dark dashboard showing 25 global border crossings with risk levels, wait times, throughput metrics, commodity flows, and route connections.


✨ Features
FeatureDescription🗺️ Interactive MapWorld map with color-coded risk markers and connecting route lines📊 Live MetricsTotal crossings, active count, avg wait time, total daily volume🚨 Delay CardsTop delayed crossings ranked by wait time⚖️ CompareSide-by-side comparison of any two crossings📈 ChartsVisual breakdown of risk, throughput and commodity data🧠 AnalyticsPandas-powered analysis of delays and throughput🌍 Trade DataCommodity flow visualization across crossings🏛️ CensusCrossing census and demographic data📏 DistanceDistance calculator between crossings✨ deck.glAdvanced 3D visualization layer🔍 Smart SearchSearch by name, country, or commodity🎯 FiltersFilter by risk level, status, and type❓ Why This MattersExplanation panel for everyday viewers🚂 Who Controls The RailKey stakeholders and customs authorities📥 DownloadExport crossing data as CSV

🛠️ Tech Stack
Frontend

Next.js 14 — React framework with App Router
TypeScript — Type-safe development
Tailwind CSS — Utility-first styling
Leaflet.js — Interactive map rendering
deck.gl — Advanced WebGL visualizations

Backend

Python FastAPI — High-performance REST API
Pandas — Data analysis and ETL
Uvicorn — ASGI server


📂 Project Structure
Border-crosssing-map/
├── backend/
│   ├── main.py              # FastAPI app with all API endpoints
│   ├── crossing_service.py  # Business logic and data service
│   ├── data/
│   │   └── crossings.json   # Crossing data
│   ├── routers/             # API route handlers
│   └── requirements.txt     # Python dependencies
├── frontend/
│   └── app/
│       ├── components/
│       │   ├── BorderMap.tsx         # Interactive Leaflet map
│       │   ├── Analytics.tsx         # Pandas analytics dashboard
│       │   ├── Charts.tsx            # Data visualizations
│       │   ├── Compare.tsx           # Crossing comparison
│       │   ├── DelayCards.tsx        # Delay rankings
│       │   ├── Sidebar.tsx           # Intelligence sidebar
│       │   ├── TradeData.tsx         # Commodity flows
│       │   ├── Census.tsx            # Census data
│       │   ├── DistanceCalculator.tsx# Distance tool
│       │   ├── DeckMap.tsx           # deck.gl overlay
│       │   └── Search.tsx            # Smart search
│       ├── page.tsx                  # Main dashboard page
│       └── types.ts                  # TypeScript types
├── .env.example             # Environment variables template
├── .gitignore
└── README.md

🚀 Getting Started
Prerequisites

Node.js 18+
Python 3.9+
npm or yarn

1. Clone the repository
bashgit clone https://github.com/Real-Rails-Interns-Batch2/POC-39-Border-Crossing-Map-Arathy.git
cd POC-39-Border-Crossing-Map-Arathy
2. Set up environment variables
bashcp .env.example .env
3. Start the backend
bashcd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
Backend runs on: http://localhost:8000
4. Start the frontend
bashcd frontend
npm install
npm run dev
Frontend runs on: http://localhost:3000

🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/crossings` | GET | All border crossings with filters |
| `/api/stats` | GET | Aggregate statistics |
| `/api/delays` | GET | Top 10 highest delay crossings |
| `/api/compare` | GET | Compare specific crossings by ID |
| `/api/analytics` | GET | Pandas-powered analytics |
| `/api/health` | GET | API health check |

📊 Data Sources
SourceStatusDescriptionOpenStreetMap OverpassLiveBorder crossing locationsUN ComtradeSyntheticGlobal commodity trade dataUS Census BureauSyntheticUS border crossing statisticsWait Time EventsSyntheticCrossing wait time eventsThroughput DataSyntheticDaily volume throughput

Note: Synthetic data is clearly labelled per Real Rails manifesto guidelines. All mock data is representative of real-world patterns.


🎨 Dashboard Panels
Why This Matters
Border crossings are critical choke points in global supply chains. Every hour of delay at a high-volume crossing cascades into inventory shortfalls, price volatility, and logistics re-routing costs.
Who Controls The Rail

CBDT (India) — Customs & Tax Authority
US CBP — Customs & Border Protection
HMRC (UK) — Revenue & Customs
WCO — World Customs Organization


👩‍💻 Built By
Arathy Rajeev
AI Engineer Intern · Boston Institute of Analytics
Real Rails Intelligence Library · POC-39
