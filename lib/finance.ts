import { add, lineAmount, money, percentOf, roundMoney, toMoneyString } from "@/lib/money";

export function boqItemTotals(item: {
  quantity: unknown;
  materialRate: unknown;
  labourRate: unknown;
  equipmentRate: unknown;
}) {
  const materialTotal = lineAmount(String(item.quantity), String(item.materialRate));
  const labourTotal = lineAmount(String(item.quantity), String(item.labourRate));
  const equipmentTotal = lineAmount(String(item.quantity), String(item.equipmentRate));
  const total = add(materialTotal, labourTotal, equipmentTotal);
  const unitRate = roundMoney(
    add(String(item.materialRate), String(item.labourRate), String(item.equipmentRate)),
  );
  return { materialTotal, labourTotal, equipmentTotal, total, unitRate };
}

export function summarizeBoq(
  items: Array<{
    quantity: unknown;
    materialRate: unknown;
    labourRate: unknown;
    equipmentRate: unknown;
  }>,
  extras: {
    overheadPct: unknown;
    contingencyPct: unknown;
    profitPct: unknown;
    discount: unknown;
    vatPct: unknown;
  },
) {
  const works = items.reduce((sum, item) => add(sum, boqItemTotals(item).total), money(0));
  const overhead = percentOf(works, String(extras.overheadPct));
  const contingency = percentOf(works, String(extras.contingencyPct));
  const profit = percentOf(add(works, overhead, contingency), String(extras.profitPct));
  const subtotal = add(works, overhead, contingency, profit);
  const afterDiscount = roundMoney(subtotal.minus(money(String(extras.discount))));
  const vat = percentOf(afterDiscount, String(extras.vatPct));
  const grand = add(afterDiscount, vat);
  return {
    works: toMoneyString(works),
    overhead: toMoneyString(overhead),
    contingency: toMoneyString(contingency),
    profit: toMoneyString(profit),
    subtotal: toMoneyString(subtotal),
    afterDiscount: toMoneyString(afterDiscount),
    vat: toMoneyString(vat),
    grand: toMoneyString(grand),
  };
}

export function documentTotals(
  items: Array<{ quantity: unknown; rate: unknown }>,
  discount: unknown,
  vatPct: unknown,
) {
  const subtotal = items.reduce(
    (sum, item) => add(sum, lineAmount(String(item.quantity), String(item.rate))),
    money(0),
  );
  const afterDiscount = roundMoney(subtotal.minus(money(String(discount))));
  const vat = percentOf(afterDiscount, String(vatPct));
  const grand = add(afterDiscount, vat);
  return {
    subtotal: toMoneyString(subtotal),
    vat: toMoneyString(vat),
    grand: toMoneyString(grand),
  };
}

export function costingSummary(input: {
  contractValue: unknown;
  estimated: unknown;
  actual: unknown;
}) {
  const contract = money(String(input.contractValue));
  const estimated = money(String(input.estimated));
  const actual = money(String(input.actual));
  const estProfit = contract.minus(estimated);
  const actProfit = contract.minus(actual);
  const estMargin = contract.isZero() ? money(0) : estProfit.dividedBy(contract).times(100);
  const actMargin = contract.isZero() ? money(0) : actProfit.dividedBy(contract).times(100);
  return {
    estimatedProfit: toMoneyString(estProfit),
    actualProfit: toMoneyString(actProfit),
    estimatedMargin: roundMoney(estMargin).toFixed(2),
    actualMargin: roundMoney(actMargin).toFixed(2),
    variance: toMoneyString(actual.minus(estimated)),
  };
}
