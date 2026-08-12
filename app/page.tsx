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
import { calculateGrowth } from "@/lib/calculateGrowth";

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

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
  const [initialAmount, setInitialAmount] = useState(1_000_000);
  const [monthlyContribution, setMonthlyContribution] = useState(30_000);
  const [annualRatePercent, setAnnualRatePercent] = useState(5);
  const [years, setYears] = useState(20);

  const results = useMemo(
    () =>
      calculateGrowth({
        initialAmount,
        monthlyContribution,
        annualRatePercent,
        years,
      }),
    [initialAmount, monthlyContribution, annualRatePercent, years],
  );

  const last = results.at(-1) ?? {
    year: 0,
    principal: initialAmount,
    interest: 0,
    total: initialAmount,
  };

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <main className="flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            資産形成シミュレーター
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            初期投資額・毎月の積立額・想定利回りを入力すると、将来の資産推移を試算します。
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2">
          <NumberField
            label="初期投資額"
            value={initialAmount}
            onChange={setInitialAmount}
            step={10_000}
            suffix="円"
          />
          <NumberField
            label="毎月の積立額"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            step={1_000}
            suffix="円"
          />
          <NumberField
            label="想定年利率"
            value={annualRatePercent}
            onChange={setAnnualRatePercent}
            step={0.1}
            suffix="%"
          />
          <NumberField
            label="積立年数"
            value={years}
            onChange={(v) => setYears(Math.min(60, v))}
            min={1}
            step={1}
            suffix="年"
          />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="最終資産額" value={yen.format(last.total)} accent />
          <SummaryCard label="元本合計" value={yen.format(last.principal)} />
          <SummaryCard label="運用益" value={yen.format(last.interest)} />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            資産推移
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
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
                    name === "principal" ? "元本" : "運用益",
                  ]}
                  labelFormatter={(y) => `${y}年目`}
                />
                <Legend
                  formatter={(name) => (name === "principal" ? "元本" : "運用益")}
                />
                <Area
                  type="monotone"
                  dataKey="principal"
                  stackId="1"
                  stroke="#3f3f46"
                  fill="#a1a1aa"
                />
                <Area
                  type="monotone"
                  dataKey="interest"
                  stackId="1"
                  stroke="#059669"
                  fill="#6ee7b7"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
