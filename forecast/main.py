from fastapi import FastAPI
from pydantic import BaseModel
from statsmodels.tsa.arima.model import ARIMA
from datetime import date, timedelta
from collections import defaultdict
import pandas as pd
import numpy as np

app = FastAPI(title="Forecast Service")

# ── Schemas ───────────────────────────────────────────────────────────────

class SaleRecord(BaseModel):
    sold_at:  date
    quantity: int

class ProductInput(BaseModel):
    product_id:    int
    product_name:  str
    sku:           str
    current_stock: int
    price:         float = 0.0
    sales:         list[SaleRecord]

class ForecastRequest(BaseModel):
    products:      list[ProductInput]
    forecast_days: int = 30
    history_days:  int = 90

class DailyPoint(BaseModel):
    date: str
    quantity: int

class ForecastDetail(BaseModel):
    product_id:      int
    product_name:    str
    sku:             str
    forecast_total:  int
    daily_avg:       float
    daily_breakdown: list[DailyPoint]
    method:          str

class RecommendationItem(BaseModel):
    product_id:      int
    product_name:    str
    sku:             str
    current_stock:   int
    forecast_total:  int
    recommend_order: int
    stock_days_left: int
    urgency:         str

class MonthlyPoint(BaseModel):
    month:            str
    forecast_qty:     int
    forecast_revenue: float

# ── Core ──────────────────────────────────────────────────────────────────

def predict(sales: list[SaleRecord], forecast_days: int, history_days: int) -> tuple[list[int], str]:
    daily         = {s.sold_at: s.quantity for s in sales}
    date_range    = pd.date_range(date.today() - timedelta(days=history_days), date.today(), freq='D')
    series        = pd.Series([daily.get(d.date(), 0) for d in date_range], index=date_range, dtype=float)
    non_zero_days = int((series > 0).sum())

    if series.sum() == 0:
        return [0] * forecast_days, "no_data"

    if non_zero_days < 14:
        total_sold     = float(series.sum())
        # среднее кол-во продаж за период → прогноз на forecast_days
        daily_avg      = total_sold / history_days
        forecast_total = round(daily_avg * forecast_days)

        # распределяем равномерно по дням продаж
        # если forecast_total=4 за 30 дней — продажа каждые ~7 дней
        values = [0] * forecast_days
        if forecast_total > 0:
            step = forecast_days // forecast_total
            for i in range(forecast_total):
                idx = min(i * step, forecast_days - 1)
                values[idx] = 1

        return values, "mean_fallback"

    try:
        values = np.maximum(0, ARIMA(series, order=(7, 1, 1)).fit().forecast(steps=forecast_days))
        return values.round().astype(int).tolist(), "ARIMA(7,1,1)"
    except Exception:
        total_sold     = float(series.sum())
        daily_avg      = total_sold / history_days
        forecast_total = round(daily_avg * forecast_days)
        values         = [0] * forecast_days
        if forecast_total > 0:
            step = forecast_days // forecast_total
            for i in range(forecast_total):
                idx = min(i * step, forecast_days - 1)
                values[idx] = 1
        return values, "mean_fallback"

# ── API ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/forecast", response_model=list[ForecastDetail])
async def forecast(req: ForecastRequest):
    results = []
    for p in req.products:
        values, method = predict(p.sales, req.forecast_days, req.history_days)
        results.append(ForecastDetail(
            product_id=p.product_id,
            product_name=p.product_name,
            sku=p.sku,
            forecast_total=sum(values),
            daily_avg=round(sum(values) / req.forecast_days, 2),
            daily_breakdown=[
                DailyPoint(date=str(date.today() + timedelta(days=i + 1)), quantity=v)
                for i, v in enumerate(values)
            ],
            method=method,
        ))
    return results

@app.post("/recommendations", response_model=list[RecommendationItem])
async def recommendations(req: ForecastRequest):
    results = []
    for p in req.products:
        values, _ = predict(p.sales, req.forecast_days, req.history_days)
        total     = sum(values)
        daily_avg = total / req.forecast_days if req.forecast_days > 0 else 0
        order_qty = max(total - p.current_stock, 0)

        if order_qty == 0:
            continue

        stock_days = int(p.current_stock / daily_avg) if daily_avg > 0 else 999
        urgency    = "high" if stock_days <= 7 else "medium" if stock_days <= 14 else "ok"

        results.append(RecommendationItem(
            product_id=p.product_id,   product_name=p.product_name,
            sku=p.sku,                 current_stock=p.current_stock,
            forecast_total=total,      recommend_order=order_qty,
            stock_days_left=stock_days, urgency=urgency,
        ))

    return sorted(results, key=lambda x: {"high": 0, "medium": 1, "ok": 2}[x.urgency])

@app.post("/forecast/monthly", response_model=list[MonthlyPoint])
async def forecast_monthly(req: ForecastRequest):
    qty_by_month: dict[str, int]   = defaultdict(int)
    rev_by_month: dict[str, float] = defaultdict(float)

    for p in req.products:
        values, _ = predict(p.sales, req.forecast_days, req.history_days)
        for i, qty in enumerate(values):
            month = (date.today() + timedelta(days=i + 1)).strftime("%Y-%m-01")
            qty_by_month[month] += qty
            rev_by_month[month] += qty * p.price

    return [
        MonthlyPoint(month=m, forecast_qty=qty_by_month[m], forecast_revenue=round(rev_by_month[m], 2))
        for m in sorted(qty_by_month)
    ]