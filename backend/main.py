"""
POC 39 — Border Crossing Activity Map
FastAPI Backend · Real Rails Intelligence Library
Run: uvicorn main:app --reload --port 8000
"""

import json
import os
from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Border Crossing Intelligence API", version="1.0.0")

# ── CORS — reads from environment for Render deployment ──────────────────────
CORS_ORIGINS  = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load all data from JSON files ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_json(filename: str) -> dict:
    path = os.path.join(BASE_DIR, "data", filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def build_df() -> pd.DataFrame:
    data = load_json("mock_data.json")
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


@app.get("/api/census")
def get_census():
    data = load_json("census_data.json")
    return data


@app.get("/api/trade")
def get_trade(flow: Optional[str] = None):
    data = load_json("trade_data.json")
    trade_flows = data["trade_flows"]
    if flow and flow != "All":
        trade_flows = [t for t in trade_flows if t["flow"] == flow]
    return {
        "data": trade_flows,
        "meta": data["meta"]
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "poc": 39,
        "name": "Border Crossing Activity Map",
        "data_sources": {
            "crossings": "mock_data.json",
            "census": "census_data.json",
            "trade": "trade_data.json"
        }
    }