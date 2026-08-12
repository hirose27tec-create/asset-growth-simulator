export type Currency = "JPY" | "USD" | "GBP" | "EUR";

export const CURRENCIES: Currency[] = ["JPY", "USD", "GBP", "EUR"];

// 概算の対円レート。ユーザーがUI上で上書き編集できる初期値。
export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  JPY: 1,
  USD: 155,
  GBP: 195,
  EUR: 165,
};

export interface Investment {
  id: string;
  label: string;
  currency: Currency;
  principal: number;
  monthlyContribution: number;
  annualRatePercent: number;
  startDate: string; // ISO yyyy-mm-dd、過去日付も可
  endDate: string; // ISO yyyy-mm-dd、このシミュレーションで見たい終了時点
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function yearsBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MS_PER_YEAR;
}

// 開始日〜endDateでクランプした時点までの経過年数（小数）。開始前はnull。
function elapsedYearsAt(investment: Investment, at: Date): number | null {
  const start = new Date(investment.startDate);
  const end = new Date(investment.endDate);
  const effectiveAt = at.getTime() > end.getTime() ? end : at;
  if (effectiveAt.getTime() <= start.getTime()) return null;
  return yearsBetween(start, effectiveAt);
}

// 指定時点での評価額（現地通貨建て）。経過年数を指数にとる複利計算（元本＋積立分）。
export function valueAt(investment: Investment, at: Date): number {
  const t = elapsedYearsAt(investment, at);
  if (t === null) return 0;

  const r = investment.annualRatePercent / 100;
  const annualContribution = investment.monthlyContribution * 12;

  const principalValue = investment.principal * Math.pow(1 + r, t);
  const contributionValue =
    r === 0
      ? annualContribution * t
      : (annualContribution * (Math.pow(1 + r, t) - 1)) / r;

  return principalValue + contributionValue;
}

// 指定時点までに投じた元本（初期投資＋積立累計、現地通貨建て）
export function investedAmountAt(investment: Investment, at: Date): number {
  const t = elapsedYearsAt(investment, at);
  if (t === null) return 0;
  return investment.principal + investment.monthlyContribution * 12 * t;
}

export function toJpy(
  amount: number,
  currency: Currency,
  rates: Record<Currency, number>,
): number {
  return amount * rates[currency];
}

export interface TimelinePoint {
  year: number;
  values: Record<string, number>; // investment.id -> JPY評価額
  total: number;
}

// 複数投資を合算した年次タイムライン（各投資の開始年〜終了年をカバー）
export function buildTimeline(
  investments: Investment[],
  rates: Record<Currency, number>,
): TimelinePoint[] {
  if (investments.length === 0) return [];

  const minYear = Math.min(
    ...investments.map((inv) => new Date(inv.startDate).getFullYear()),
  );
  const maxYear = Math.max(
    ...investments.map((inv) => new Date(inv.endDate).getFullYear()),
  );

  const points: TimelinePoint[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    const at = new Date(year, 11, 31);
    const values: Record<string, number> = {};
    let total = 0;
    for (const inv of investments) {
      const jpyValue = toJpy(valueAt(inv, at), inv.currency, rates);
      values[inv.id] = jpyValue;
      total += jpyValue;
    }
    points.push({ year, values, total });
  }
  return points;
}
