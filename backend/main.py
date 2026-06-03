"""
POC 39 — Border Crossing Activity Map
FastAPI Backend · Real Rails Intelligence Library
Run: uvicorn main:app --reload --port 8000
"""

import json, os
from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Border Crossing Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load data from mock_data.json ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_DATA_PATH = os.path.join(BASE_DIR, "data", "mock_data.json")

def load_mock_data() -> dict:
    with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def build_df() -> pd.DataFrame:
    data = load_mock_data()
    df = pd.DataFrame(data["crossings"])
    df["lng"] = df["lon"]
    avg_wait = df["wait_time"].mean()
    df["wait_vs_avg"] = ((df["wait_time"] - avg_wait) / avg_wait * 100).round(1)
    df["delay_label"] = df["wait_time"].apply(
        lambda x: "Critical" if x > 120 else "High" if x > 60 else "Moderate" if x > 30 else "Normal"
    )
    df["throughput_tier"] = df["throughput"].apply(
        lambda x: "Major Hub" if x > 10000 else "Active" if x > 3000 else "Mid-Volume" if x > 1000 else "Low-Volume"
    )
    return df


@app.get("/api/crossings")
def get_crossings(
    risk: Optional[str] = None,
    status: Optional[str] = None,
    commodity: Optional[str] = None,
):
    df = build_df()
    if risk:      df = df[df["risk_level"] == risk]
    if status:    df = df[df["status"] == status]
    if commodity: df = df[df["commodity"].str.contains(commodity, case=False)]
    return {
        "data": json.loads(df.to_json(orient="records")),
        "meta": {
            "total": len(df),
            "synthetic": True,
            "source": "Real Rails POC 39 — mock_data.json"
        }
    }


@app.get("/api/stats")
def get_stats():
    df = build_df()
    return {
        "total": len(df),
        "active": int((df["status"] == "Active").sum()),
        "restricted": int((df["status"] == "Restricted").sum()),
        "seasonal": int((df["status"] == "Seasonal").sum()),
        "high_risk": int((df["risk_level"] == "High").sum()),
        "avg_wait_time": round(df["wait_time"].mean(), 1),
        "total_throughput": int(df["throughput"].sum()),
        "critical_delays": int((df["delay_label"] == "Critical").sum()),
        "commodities": df["commodity"].value_counts().to_dict(),
        "risk_breakdown": df["risk_level"].value_counts().to_dict(),
        "type_breakdown": df["type"].value_counts().to_dict(),
    }


@app.get("/api/delays")
def get_delays():
    df = build_df()
    top = df.nlargest(10, "wait_time")
    return {"data": json.loads(top.to_json(orient="records"))}


@app.get("/api/compare")
def compare_crossings(ids: str = Query(...)):
    id_list = [int(i) for i in ids.split(",")]
    df = build_df()
    result = df[df["id"].isin(id_list)]
    return {"data": json.loads(result.to_json(orient="records"))}


@app.get("/api/analytics")
def get_analytics():
    df = build_df()
    return {
        "avg_wait_by_risk": df.groupby("risk_level")["wait_time"].mean().round(1).to_dict(),
        "avg_throughput_by_type": df.groupby("type")["throughput"].mean().round(0).to_dict(),
        "total_throughput_by_commodity": df.groupby("commodity")["throughput"].sum().to_dict(),
        "top_delays": json.loads(
            df.nlargest(3, "wait_time")[["name", "wait_time", "country"]].to_json(orient="records")
        ),
        "top_throughput": json.loads(
            df.nlargest(3, "throughput")[["name", "throughput", "country"]].to_json(orient="records")
        ),
    }


# ── NEW: Census endpoint ──────────────────────────────────────────────────────
@app.get("/api/census")
def get_census():
    return {
        "border_stats": [
            { "crossing": "San Ysidro", "state": "California", "trucks_per_day": 4200, "cars_per_day": 71000, "year": 2023 },
            { "crossing": "Detroit-Windsor", "state": "Michigan", "trucks_per_day": 8500, "cars_per_day": 12000, "year": 2023 },
            { "crossing": "Peace Arch", "state": "Washington", "trucks_per_day": 1200, "cars_per_day": 24000, "year": 2023 },
        ],
        "county_data": [
            { "name": "San Diego County", "state": "California", "population": "3,298,634", "income": "$78,980" },
            { "name": "El Paso County", "state": "Texas", "population": "865,657", "income": "$44,431" },
            { "name": "Wayne County", "state": "Michigan", "population": "1,759,335", "income": "$51,285" },
            { "name": "Whatcom County", "state": "Washington", "population": "229,247", "income": "$68,750" },
        ],
        "meta": { "synthetic": True, "source": "US Census Bureau Format" }
    }


# ── NEW: Trade endpoint ───────────────────────────────────────────────────────
@app.get("/api/trade")
def get_trade(flow: Optional[str] = None):
    trade_data = [
        { "reporter": "USA", "partner": "Canada", "commodity": "Automobiles", "trade_value_usd": 48000000000, "year": 2023, "flow": "Export" },
        { "reporter": "USA", "partner": "Mexico", "commodity": "Consumer Goods", "trade_value_usd": 32000000000, "year": 2023, "flow": "Import" },
        { "reporter": "France", "partner": "United Kingdom", "commodity": "Mixed Goods", "trade_value_usd": 28000000000, "year": 2023, "flow": "Export" },
        { "reporter": "India", "partner": "Bangladesh", "commodity": "Agricultural", "trade_value_usd": 12000000000, "year": 2023, "flow": "Export" },
        { "reporter": "Singapore", "partner": "Malaysia", "commodity": "Electronics", "trade_value_usd": 65000000000, "year": 2023, "flow": "Export" },
        { "reporter": "Hong Kong", "partner": "China", "commodity": "Electronics", "trade_value_usd": 89000000000, "year": 2023, "flow": "Import" },
        { "reporter": "Turkey", "partner": "Syria", "commodity": "Humanitarian", "trade_value_usd": 2000000000, "year": 2023, "flow": "Export" },
        { "reporter": "India", "partner": "Pakistan", "commodity": "Agricultural", "trade_value_usd": 3000000000, "year": 2023, "flow": "Export" },
    ]
    if flow and flow != "All":
        trade_data = [t for t in trade_data if t["flow"] == flow]
    return {
        "data": trade_data,
        "meta": { "synthetic": True, "source": "UN Comtrade Format" }
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "poc": 39,
        "name": "Border Crossing Activity Map",
        "data_source": "mock_data.json"
    }
