"""
POC 39 — Border Crossing Activity Map
FastAPI Backend · Real Rails Intelligence Library
Run: uvicorn main:app --reload --port 8000
"""

import json, os, random
from datetime import datetime
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

# ── Synthetic Data — labelled clearly per manifesto ──────────────────────────
RAW_CROSSINGS = [
    {"id": 1,  "name": "Wagah Border",           "country": "India - Pakistan",    "lat": 31.6040,  "lon": 74.5730,  "type": "Land",  "commodity": "Textiles",      "wait_time": 85,  "throughput": 1200,  "status": "Restricted", "risk_level": "High"},
    {"id": 2,  "name": "Petrapole-Benapole",     "country": "India - Bangladesh",  "lat": 23.0200,  "lon": 88.9300,  "type": "Land",  "commodity": "Consumer Goods","wait_time": 45,  "throughput": 3500,  "status": "Active",     "risk_level": "Medium"},
    {"id": 3,  "name": "Attari-Lahore",          "country": "India - Pakistan",    "lat": 31.7200,  "lon": 74.8600,  "type": "Rail",  "commodity": "Agriculture",   "wait_time": 120, "throughput": 800,   "status": "Restricted", "risk_level": "High"},
    {"id": 4,  "name": "Moreh-Tamu",             "country": "India - Myanmar",     "lat": 24.2300,  "lon": 94.2800,  "type": "Land",  "commodity": "Timber",        "wait_time": 30,  "throughput": 950,   "status": "Active",     "risk_level": "Medium"},
    {"id": 5,  "name": "Nathu La Pass",          "country": "India - China",       "lat": 27.3900,  "lon": 88.8300,  "type": "Land",  "commodity": "Electronics",   "wait_time": 60,  "throughput": 600,   "status": "Seasonal",   "risk_level": "Medium"},
    {"id": 6,  "name": "Calais-Dover",           "country": "France - UK",         "lat": 50.9580,  "lon": 1.8584,   "type": "Sea",   "commodity": "Mixed Freight",  "wait_time": 25,  "throughput": 8500,  "status": "Active",     "risk_level": "Low"},
    {"id": 7,  "name": "US-Mexico San Ysidro",   "country": "USA - Mexico",        "lat": 32.5430,  "lon": -117.028, "type": "Land",  "commodity": "Vehicles",      "wait_time": 95,  "throughput": 12000, "status": "Active",     "risk_level": "High"},
    {"id": 8,  "name": "US-Canada Peace Arch",   "country": "USA - Canada",        "lat": 49.0025,  "lon": -122.757, "type": "Land",  "commodity": "Lumber",        "wait_time": 15,  "throughput": 6500,  "status": "Active",     "risk_level": "Low"},
    {"id": 9,  "name": "Rafah Crossing",         "country": "Egypt - Gaza",        "lat": 31.2720,  "lon": 34.2430,  "type": "Land",  "commodity": "Humanitarian",  "wait_time": 180, "throughput": 200,   "status": "Restricted", "risk_level": "High"},
    {"id": 10, "name": "Bab al-Hawa",            "country": "Turkey - Syria",      "lat": 36.4400,  "lon": 36.6300,  "type": "Land",  "commodity": "Aid Goods",     "wait_time": 150, "throughput": 350,   "status": "Restricted", "risk_level": "High"},
    {"id": 11, "name": "Dostyk-Alashankou",      "country": "Kazakhstan - China",  "lat": 45.2800,  "lon": 82.3200,  "type": "Rail",  "commodity": "Coal",          "wait_time": 40,  "throughput": 4200,  "status": "Active",     "risk_level": "Low"},
    {"id": 12, "name": "Khorgos Gateway",        "country": "Kazakhstan - China",  "lat": 44.2700,  "lon": 80.2000,  "type": "Rail",  "commodity": "Electronics",   "wait_time": 18,  "throughput": 7800,  "status": "Active",     "risk_level": "Low"},
    {"id": 13, "name": "Luanda-Kinshasa Ferry",  "country": "Angola - DRC",        "lat": -4.3200,  "lon": 15.3200,  "type": "Sea",   "commodity": "Oil Products",  "wait_time": 200, "throughput": 450,   "status": "Active",     "risk_level": "High"},
    {"id": 14, "name": "Beitbridge",             "country": "Zimbabwe - S.Africa", "lat": -22.2167, "lon": 30.0000,  "type": "Land",  "commodity": "Agriculture",   "wait_time": 110, "throughput": 2100,  "status": "Active",     "risk_level": "High"},
    {"id": 15, "name": "Nimule-Elegu",           "country": "S. Sudan - Uganda",   "lat": 3.5900,   "lon": 32.0500,  "type": "Land",  "commodity": "Food Aid",      "wait_time": 90,  "throughput": 600,   "status": "Active",     "risk_level": "High"},
    {"id": 16, "name": "Sungai Kolok",           "country": "Thailand - Malaysia", "lat": 6.0260,   "lon": 101.967,  "type": "Land",  "commodity": "Rubber",        "wait_time": 20,  "throughput": 3200,  "status": "Active",     "risk_level": "Low"},
    {"id": 17, "name": "Muse-Ruili",             "country": "Myanmar - China",     "lat": 23.9900,  "lon": 97.8700,  "type": "Land",  "commodity": "Jade",          "wait_time": 55,  "throughput": 1800,  "status": "Active",     "risk_level": "Medium"},
    {"id": 18, "name": "Chumphon Pass",          "country": "Thailand - Myanmar",  "lat": 10.4900,  "lon": 99.1800,  "type": "Land",  "commodity": "Seafood",       "wait_time": 35,  "throughput": 1100,  "status": "Seasonal",   "risk_level": "Medium"},
    {"id": 19, "name": "Irun-Hendaye",           "country": "Spain - France",      "lat": 43.3490,  "lon": -1.7890,  "type": "Rail",  "commodity": "Automobiles",   "wait_time": 10,  "throughput": 9500,  "status": "Active",     "risk_level": "Low"},
    {"id": 20, "name": "Brenner Pass",           "country": "Austria - Italy",     "lat": 47.0020,  "lon": 11.5080,  "type": "Rail",  "commodity": "Mixed Freight",  "wait_time": 8,   "throughput": 11000, "status": "Active",     "risk_level": "Low"},
    {"id": 21, "name": "Tijuana-San Diego",      "country": "Mexico - USA",        "lat": 32.4850,  "lon": -117.038, "type": "Land",  "commodity": "Produce",       "wait_time": 105, "throughput": 9800,  "status": "Active",     "risk_level": "High"},
    {"id": 22, "name": "Nuevo Laredo-Laredo",    "country": "Mexico - USA",        "lat": 27.4760,  "lon": -99.5150, "type": "Land",  "commodity": "Manufacturing", "wait_time": 75,  "throughput": 14000, "status": "Active",     "risk_level": "Medium"},
    {"id": 23, "name": "Narva Bridge",           "country": "Estonia - Russia",    "lat": 59.3760,  "lon": 28.1960,  "type": "Land",  "commodity": "Energy",        "wait_time": 240, "throughput": 300,   "status": "Restricted", "risk_level": "High"},
    {"id": 24, "name": "Yaoundé-Bangui Road",    "country": "Cameroon - CAR",      "lat": 5.3800,   "lon": 16.0400,  "type": "Land",  "commodity": "Timber",        "wait_time": 160, "throughput": 280,   "status": "Active",     "risk_level": "High"},
    {"id": 25, "name": "Suez Canal Entry",       "country": "Egypt",               "lat": 30.0444,  "lon": 32.5498,  "type": "Sea",   "commodity": "Oil/LNG",       "wait_time": 12,  "throughput": 52000, "status": "Active",     "risk_level": "Low"},
]


def build_df() -> pd.DataFrame:
    df = pd.DataFrame(RAW_CROSSINGS)
    df["lng"] = df["lon"]  # alias — some frontend components use lng
    # Intelligence layer — transform raw data into insights
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
        "meta": {"total": len(df), "synthetic": True, "source": "Real Rails POC 39"}
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


@app.get("/api/health")
def health():
    return {"status": "ok", "poc": 39, "name": "Border Crossing Activity Map"}