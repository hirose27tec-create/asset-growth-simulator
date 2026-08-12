"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CURRENCIES,
  Currency,
  DEFAULT_EXCHANGE_RATES,
  Investment,
  buildTimeline,
  investedAmountAt,
  toJpy,
  valueAt,
} from "@/lib/calculateGrowth";

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const CHART_COLORS = [
  "#6366f1",
  "#059669",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function yearsFromTodayIso(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function createDefaultInvestment(): Investment {
  return {
    id: crypto.randomUUID(),
    label: "一般的な投資",
    currency: "JPY",
    principal: 1_000_000,
    monthlyContribution: 30_000,
    annualRatePercent: 5,
    startDate: todayIso(),
    endDate: yearsFromTodayIso(20),
  };
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input
        type="text"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-base tabular-nums outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
          value={value}
          min={min}
          step={step}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(Number.isFinite(next) ? Math.max(min, next) : min);
          }}
        />
        {suffix && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input
        type="date"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Currency;
  onChange: (value: Currency) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <select
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span
        className={`text-2xl font-semibold tabular-nums ${
          accent
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([
    createDefaultInvestment(),
  ]);
  const [rates, setRates] =
    useState<Record<Currency, number>>(DEFAULT_EXCHANGE_RATES);

  const updateInvestment = (id: string, patch: Partial<Investment>) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)),
    );
  };

  const addInvestment = () => {
    setInvestments((prev) => [
      ...prev,
      {
        ...createDefaultInvestment(),
        label: `投資${prev.length + 1}`,
      },
    ]);
  };

  const removeInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  const today = useMemo(() => new Date(), []);

  const totals = useMemo(() => {
    let value = 0;
    let invested = 0;
    for (const inv of investments) {
      value += toJpy(valueAt(inv, today), inv.currency, rates);
      invested += toJpy(investedAmountAt(inv, today), inv.currency, rates);
    }
    return { value, invested, gain: value - invested };
  }, [investments, rates, today]);

  const timeline = useMemo(
    () => buildTimeline(investments, rates),
    [investments, rates],
  );

  const chartData = useMemo(
    () =>
      timeline.map((point) => ({
        year: point.year,
        ...point.values,
      })),
    [timeline],
  );

  const investmentLabelById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const inv of investments) map[inv.id] = inv.label;
    return map;
  }, [investments]);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <main className="flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            資産形成シミュレーター
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            投資を自由に追加し、通貨や開始日が異なる複数の投資をまとめて資産推移を試算します。
          </p>
        </div>

        <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            為替レート（対円、概算値・編集可）
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CURRENCIES.filter((c) => c !== "JPY").map((c) => (
              <NumberField
                key={c}
                label={`1 ${c} = 何円`}
                value={rates[c]}
                onChange={(v) => setRates((prev) => ({ ...prev, [c]: v }))}
                step={0.5}
                suffix="円"
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          {investments.map((inv, index) => (
            <div
              key={inv.id}
              className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div className="flex items-center justify-between sm:col-span-2 lg:col-span-3">
                <span
                  className="text-xs font-medium text-zinc-400"
                  style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}
                >
                  ● 投資 {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeInvestment(inv.id)}
                  className="text-sm text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  削除
                </button>
              </div>
              <TextField
                label="ラベル"
                value={inv.label}
                onChange={(v) => updateInvestment(inv.id, { label: v })}
              />
              <CurrencyField
                label="通貨"
                value={inv.currency}
                onChange={(v) => updateInvestment(inv.id, { currency: v })}
              />
              <NumberField
                label="元本（一括投資額）"
                value={inv.principal}
                onChange={(v) => updateInvestment(inv.id, { principal: v })}
                step={10_000}
              />
              <NumberField
                label="毎月積立額"
                value={inv.monthlyContribution}
                onChange={(v) =>
                  updateInvestment(inv.id, { monthlyContribution: v })
                }
                step={1_000}
              />
              <NumberField
                label="想定年利率"
                value={inv.annualRatePercent}
                onChange={(v) =>
                  updateInvestment(inv.id, { annualRatePercent: v })
                }
                step={0.1}
                suffix="%"
              />
              <DateField
                label="開始日（過去日付も可）"
                value={inv.startDate}
                onChange={(v) => updateInvestment(inv.id, { startDate: v })}
              />
              <DateField
                label="終了日（シミュレーション終了時点）"
                value={inv.endDate}
                onChange={(v) => updateInvestment(inv.id, { endDate: v })}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addInvestment}
            className="rounded-xl border border-dashed border-zinc-300 bg-white py-3 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ＋ 投資を追加
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="今日時点の合計評価額"
            value={yen.format(totals.value)}
            accent
          />
          <SummaryCard
            label="今日時点の投下元本合計"
            value={yen.format(totals.invested)}
          />
          <SummaryCard
            label="今日時点の運用益"
            value={yen.format(totals.gain)}
          />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            資産推移（合算・投資ごとの内訳）
          </h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              投資を追加するとグラフが表示されます。
            </p>
          ) : (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                  />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(y) => `${y}年`}
                    className="text-xs"
                  />
                  <YAxis
                    tickFormatter={(v) => `${Math.round(v / 10_000)}万`}
                    className="text-xs"
                    width={56}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      yen.format(Number(value) || 0),
                      investmentLabelById[String(name)] ?? String(name),
                    ]}
                    labelFormatter={(y) => `${y}年`}
                  />
                  <Legend
                    formatter={(name) =>
                      investmentLabelById[String(name)] ?? String(name)
                    }
                  />
                  {investments.map((inv, index) => (
                    <Area
                      key={inv.id}
                      type="monotone"
                      dataKey={inv.id}
                      name={inv.id}
                      stackId="1"
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      fillOpacity={0.55}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
