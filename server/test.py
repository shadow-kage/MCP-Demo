import asyncio
from weather import get_alerts, get_forecast  # import any tool you want to test

async def main():
    print("🔍 Getting weather alerts for CA:")
    alerts = await get_alerts(state="CA")
    print("Alerts:", alerts)

    print("\n🌤️ Getting forecast for New York coordinates:")
    forecast = await get_forecast(latitude=40.7128, longitude=-74.0060)
    print("Forecast:", forecast)

if __name__ == "__main__":
    asyncio.run(main())
