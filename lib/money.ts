import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type MoneyLike = Decimal.Value;

export function money(value: MoneyLike | null | undefined): Decimal {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }
  return new Decimal(value);
}

export function add(...values: MoneyLike[]) {
  return values.reduce<Decimal>((sum, value) => sum.plus(money(value)), new Decimal(0));
}

export function subtract(left: MoneyLike, right: MoneyLike) {
  return money(left).minus(money(right));
}

export function multiply(left: MoneyLike, right: MoneyLike) {
  return money(left).times(money(right));
}

export function percentOf(base: MoneyLike, pct: MoneyLike) {
  return money(base).times(money(pct)).dividedBy(100);
}

export function roundMoney(value: MoneyLike) {
  return money(value).toDecimalPlaces(2);
}

export function toMoneyString(value: MoneyLike) {
  return roundMoney(value).toFixed(2);
}

export function formatNPR(value: MoneyLike | null | undefined, symbol = "Rs.") {
  const amount = roundMoney(value ?? 0);
  const formatted = new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount.toFixed(2)));
  return `${symbol} ${formatted}`;
}

export function lineAmount(qty: MoneyLike, rate: MoneyLike) {
  return roundMoney(multiply(qty, rate));
}

export function assertNonNegative(value: MoneyLike, label: string) {
  if (money(value).isNegative()) {
    throw new Error(`${label} cannot be negative.`);
  }
}

export function assertPercent(value: MoneyLike, label: string) {
  const n = money(value);
  if (n.isNegative() || n.greaterThan(100)) {
    throw new Error(`${label} must be between 0 and 100.`);
  }
}
