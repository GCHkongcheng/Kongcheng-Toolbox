import { NextResponse } from "next/server";

function mapWeatherCode(code: number) {
  const mapping: Record<number, string> = {
    0: "晴朗",
    1: "基本晴",
    2: "局部多云",
    3: "阴天",
    45: "有雾",
    48: "雾凇",
    51: "小毛毛雨",
    53: "毛毛雨",
    55: "强毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    80: "阵雨",
    81: "较强阵雨",
    82: "暴雨",
    95: "雷暴",
  };

  return mapping[code] ?? "未知";
}

export async function GET() {
  const now = new Date();

  const weatherPromise = fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=31.4912&longitude=120.3119&current=temperature_2m,weather_code&timezone=Asia%2FShanghai",
    { next: { revalidate: 300 } },
  ).then((res) => res.json());

  const cryptoPromise = fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,cny",
    { next: { revalidate: 120 } },
  ).then((res) => res.json());

  const fxPromise = fetch(
    "https://api.frankfurter.app/latest?from=USD&to=CNY",
    {
      next: { revalidate: 600 },
    },
  ).then((res) => res.json());

  const goldPromise = fetch("https://api.gold-api.com/price/XAU", {
    next: { revalidate: 300 },
  }).then((res) => res.json());

  const [weatherResult, cryptoResult, fxResult, goldResult] =
    await Promise.allSettled([
      weatherPromise,
      cryptoPromise,
      fxPromise,
      goldPromise,
    ]);

  const weatherData =
    weatherResult.status === "fulfilled" && weatherResult.value?.current
      ? {
          city: "无锡",
          temperatureC: Number(weatherResult.value.current.temperature_2m),
          description: mapWeatherCode(
            Number(weatherResult.value.current.weather_code),
          ),
        }
      : null;

  const cryptoData =
    cryptoResult.status === "fulfilled" && cryptoResult.value?.bitcoin
      ? {
          btcUsd: Number(cryptoResult.value.bitcoin.usd),
          btcCny: Number(cryptoResult.value.bitcoin.cny),
        }
      : null;

  const fxData =
    fxResult.status === "fulfilled" && fxResult.value?.rates?.CNY
      ? {
          usdCny: Number(fxResult.value.rates.CNY),
        }
      : null;

  const goldData =
    goldResult.status === "fulfilled" &&
    typeof goldResult.value?.price === "number"
      ? {
          xauUsd: Number(goldResult.value.price) / 31.1034768,
          unit: "g",
        }
      : null;

  return NextResponse.json({
    nowIso: now.toISOString(),
    timezone: "Asia/Shanghai",
    weather: weatherData,
    crypto: cryptoData,
    fx: fxData,
    gold: goldData,
  });
}
