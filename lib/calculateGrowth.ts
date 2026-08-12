export interface GrowthInput {
  initialAmount: number;
  monthlyContribution: number;
  annualRatePercent: number;
  years: number;
}

export interface YearlyResult {
  year: number;
  principal: number;
  interest: number;
  total: number;
}

// 年次複利: 各年末に「前年末残高 + その年の積立合計」へ年利を掛ける
export function calculateGrowth({
  initialAmount,
  monthlyContribution,
  annualRatePercent,
  years,
}: GrowthInput): YearlyResult[] {
  const rate = annualRatePercent / 100;
  const annualContribution = monthlyContribution * 12;

  const results: YearlyResult[] = [];
  let balance = initialAmount;
  let principal = initialAmount;

  for (let year = 1; year <= years; year++) {
    balance = (balance + annualContribution) * (1 + rate);
    principal += annualContribution;
    results.push({
      year,
      principal,
      interest: balance - principal,
      total: balance,
    });
  }

  return results;
}
