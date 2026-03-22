"use client";

import { useEffect, useState } from "react";

interface SidebarWidgetsData {
  nowIso: string;
  timezone: string;
  weather: {
    city: string;
    temperatureC: number;
    description: string;
  } | null;
  crypto: {
    btcUsd: number;
    btcCny: number;
  } | null;
  fx: {
    usdCny: number;
  } | null;
  gold: {
    xauUsd: number;
    unit: string;
  } | null;
}

export function SidebarWidgets() {
  const [widgetsData, setWidgetsData] = useState<SidebarWidgetsData | null>(
    null,
  );
  const [widgetsLoading, setWidgetsLoading] = useState(true);
  const [widgetsError, setWidgetsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadWidgets = async () => {
      try {
        const res = await fetch("/api/sidebar-widgets", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("request failed");
        }

        const data = (await res.json()) as SidebarWidgetsData;
        if (!active) {
          return;
        }

        setWidgetsData(data);
        setWidgetsError(null);
      } catch {
        if (!active) {
          return;
        }

        setWidgetsError("轻量 API 暂时不可用");
      } finally {
        if (active) {
          setWidgetsLoading(false);
        }
      }
    };

    loadWidgets().catch(() => {});
    const timer = window.setInterval(() => {
      loadWidgets().catch(() => {});
    }, 120000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs">
      <p className="font-medium text-foreground">轻量资讯</p>

      {widgetsLoading && !widgetsData ? (
        <p className="mt-2 text-muted-foreground">加载中...</p>
      ) : widgetsError && !widgetsData ? (
        <p className="mt-2 text-muted-foreground">{widgetsError}</p>
      ) : widgetsData ? (
        <div className="mt-2 space-y-1.5 text-muted-foreground">
          <p>
            时间:{" "}
            {new Date(widgetsData.nowIso).toLocaleTimeString("zh-CN", {
              hour12: false,
            })}
          </p>

          {widgetsData.weather ? (
            <p>
              天气: {widgetsData.weather.city}{" "}
              {widgetsData.weather.temperatureC}
              °C · {widgetsData.weather.description}
            </p>
          ) : (
            <p>天气: 暂无数据</p>
          )}

          {widgetsData.crypto ? (
            <p>
              BTC: $
              {widgetsData.crypto.btcUsd.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </p>
          ) : (
            <p>BTC: 暂无数据</p>
          )}

          {widgetsData.gold ? (
            <p>
              金价: $
              {widgetsData.gold.xauUsd.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
              /{widgetsData.gold.unit}
              {widgetsData.fx
                ? ` (≈ ¥${(
                    widgetsData.gold.xauUsd * widgetsData.fx.usdCny
                  ).toLocaleString("zh-CN", {
                    maximumFractionDigits: 2,
                  })})`
                : ""}
            </p>
          ) : (
            <p>金价: 暂无数据</p>
          )}

          {widgetsData.fx ? (
            <p>汇率: 1 USD ≈ {widgetsData.fx.usdCny.toFixed(4)} CNY</p>
          ) : (
            <p>汇率: 暂无数据</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
