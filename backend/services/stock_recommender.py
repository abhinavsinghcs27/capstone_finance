import os
import json
import time
import re
from groq import Groq
from dotenv import load_dotenv
from services.market_data_service import MarketDataService

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

_RECOMMENDATION_CACHE = {}
_REC_CACHE_TTL = 300  # 5 minutes cache


class StockRecommenderService:
    @classmethod
    def _get_client(cls):
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured in backend environment")
        return Groq(api_key=GROQ_API_KEY)

    @classmethod
    def _fallback_recommendations(cls, stocks: list[dict], risk_level: str) -> dict:
        """Heuristic-based technical recommendation fallback in case LLM is unreachable."""
        recs = []
        for s in stocks[:6]:
            cmp = float(s["price"])
            rsi = float(s.get("rsi", 50))
            trend = s.get("trend", "Bullish")

            if rsi < 40 or trend == "Bullish":
                action = "BUY"
                target = round(cmp * 1.12, 2)
                stop_loss = round(cmp * 0.94, 2)
                upside = "+12.0%"
            elif rsi > 65:
                action = "HOLD"
                target = round(cmp * 1.05, 2)
                stop_loss = round(cmp * 0.96, 2)
                upside = "+5.0%"
            else:
                action = "ACCUMULATE"
                target = round(cmp * 1.09, 2)
                stop_loss = round(cmp * 0.95, 2)
                upside = "+9.0%"

            recs.append({
                "symbol": s["clean_symbol"],
                "company_name": s["name"],
                "sector": s["sector"],
                "action": action,
                "cmp": cmp,
                "entry_range": f"₹{round(cmp * 0.99, 1):,} - ₹{round(cmp * 1.01, 1):,}",
                "target_price": target,
                "potential_upside_pct": upside,
                "stop_loss": stop_loss,
                "risk_level": s.get("risk_profile", risk_level),
                "time_horizon": "Medium-Term (3-6 Mo)",
                "technical_signal": f"RSI at {rsi} ({s.get('rsi_status', 'Neutral')}) with {trend} structure",
                "thesis": f"Strong sector presence in {s['sector']} trading at a favorable technical risk-reward ratio."
            })

        return {
            "market_sentiment": "Bullish",
            "market_overview": "Indian equities are consolidating around key benchmark moving averages with solid domestic investment support.",
            "recommendations": recs
        }

    @classmethod
    def generate_stock_recommendations(cls, risk_level: str = "Moderate", sector_filter: str = "all") -> dict:
        """Generates real-time AI-driven stock recommendations based on live technicals and market data."""
        cache_key = f"rec_{risk_level.lower()}_{sector_filter.lower()}"
        now = time.time()
        if cache_key in _RECOMMENDATION_CACHE and (now - _RECOMMENDATION_CACHE[cache_key]["timestamp"]) < _REC_CACHE_TTL:
            return _RECOMMENDATION_CACHE[cache_key]["data"]

        try:
            # 1. Fetch live market stocks and technical indicators
            all_stocks = MarketDataService.get_market_watchlist()
            indices = MarketDataService.get_indices()

            if not all_stocks:
                return {
                    "success": False,
                    "message": "Market data is currently unavailable. Please try again."
                }

            # 2. Filter candidates matching sector
            candidates = all_stocks
            if sector_filter and sector_filter.lower() != "all":
                filtered = [s for s in candidates if sector_filter.lower() in s["sector"].lower()]
                if filtered:
                    candidates = filtered

            # 3. Format candidate data for LLM analysis
            stocks_data_summary = []
            for s in candidates[:12]:
                stocks_data_summary.append({
                    "symbol": s["clean_symbol"],
                    "name": s["name"],
                    "sector": s["sector"],
                    "risk": s["risk_profile"],
                    "cmp": s["price"],
                    "day_change_pct": f"{s['change_pct']}%",
                    "rsi": s["rsi"],
                    "trend": s["trend"],
                    "discount_from_52w_high": f"{s['discount_from_52w_high']}%"
                })

            market_summary = ", ".join([f"{idx['name']}: ₹{idx['price']:,.2f} ({idx['change_pct']}%)" for idx in indices])

            client = cls._get_client()

            system_prompt = """You are FinanceAI Chief Equity Research Analyst.
Analyze real-time Indian stock market prices, RSI, and technical indicators.
Pick 4 to 5 highest conviction stock setups matching the target risk profile.

Output strict JSON only with NO markdown fences:
{
  "market_sentiment": "Bullish",
  "market_overview": "2-sentence market mood summary",
  "recommendations": [
    {
      "symbol": "RELIANCE",
      "company_name": "Reliance Industries",
      "sector": "Energy & Retail",
      "action": "BUY",
      "cmp": 1219.20,
      "entry_range": "₹1,210 - ₹1,230",
      "target_price": 1380.00,
      "potential_upside_pct": "+13.2%",
      "stop_loss": 1150.00,
      "risk_level": "Moderate",
      "time_horizon": "Medium-Term (3-6 Mo)",
      "technical_signal": "RSI 34.2 near oversold + 50 EMA support",
      "thesis": "High conviction setup with positive risk-reward profile."
    }
  ]
}"""

            user_prompt = f"Target Risk Profile: {risk_level}\nMarket Indices: {market_summary}\nStocks:\n{json.dumps(stocks_data_summary, indent=2)}\n\nGenerate top recommendations matching this risk profile."

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=2500,
            )

            raw_content = response.choices[0].message.content.strip()

            # Clean JSON if fences present
            if "```" in raw_content:
                match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_content, re.DOTALL)
                if match:
                    raw_content = match.group(1)
                else:
                    raw_content = raw_content.replace("```json", "").replace("```", "").strip()

            try:
                parsed = json.loads(raw_content)
            except Exception:
                # If json parsing fails, use robust heuristic fallback
                parsed = cls._fallback_recommendations(candidates, risk_level)

            result = {
                "success": True,
                "risk_level": risk_level,
                "data": parsed,
                "indices": indices,
                "updated_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }

            _RECOMMENDATION_CACHE[cache_key] = {"timestamp": now, "data": result}
            return result

        except Exception as e:
            print(f"Stock recommendations error, using technical fallback: {e}")
            fallback_data = cls._fallback_recommendations(all_stocks if 'all_stocks' in locals() else [], risk_level)
            return {
                "success": True,
                "risk_level": risk_level,
                "data": fallback_data,
                "indices": MarketDataService.get_indices(),
                "updated_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
