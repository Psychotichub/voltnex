const SQRT3 = Math.sqrt(3);

export type Phase = "single" | "three";
export type Conductor = "copper" | "aluminium";

export function powerKw(opts: { voltage: number; current: number; pf: number; phase: Phase }) {
  const { voltage: v, current: i, pf, phase } = opts;
  const p = phase === "single" ? v * i * pf : SQRT3 * v * i * pf;
  return p / 1000;
}

export function currentFromPower(opts: {
  powerKw: number;
  voltage: number;
  pf: number;
  phase: Phase;
}) {
  const watts = opts.powerKw * 1000;
  if (opts.phase === "single") return watts / (opts.voltage * opts.pf);
  return watts / (SQRT3 * opts.voltage * opts.pf);
}

const RESISTIVITY = { copper: 0.0175, aluminium: 0.028 } as const;

export function voltageDrop(opts: {
  current: number;
  lengthM: number;
  sizeMm2: number;
  phase: Phase;
  conductor: Conductor;
}) {
  const r = (RESISTIVITY[opts.conductor] * opts.lengthM) / opts.sizeMm2;
  const drop =
    opts.phase === "single"
      ? 2 * opts.current * r
      : SQRT3 * opts.current * r;
  return drop;
}

const CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

export function suggestCable(opts: {
  loadKw: number;
  voltage: number;
  phase: Phase;
  pf: number;
  lengthM: number;
  conductor: Conductor;
}) {
  const current = currentFromPower({
    powerKw: opts.loadKw,
    voltage: opts.voltage,
    pf: opts.pf,
    phase: opts.phase,
  });
  const derated = current * 1.25;
  let size = CABLE_SIZES[CABLE_SIZES.length - 1];
  for (const candidate of CABLE_SIZES) {
    const drop = voltageDrop({
      current,
      lengthM: opts.lengthM,
      sizeMm2: candidate,
      phase: opts.phase,
      conductor: opts.conductor,
    });
    const pct = (drop / opts.voltage) * 100;
    if (candidate >= derated / 10 && pct <= 4) {
      size = candidate;
      break;
    }
    size = candidate;
  }
  const drop = voltageDrop({
    current,
    lengthM: opts.lengthM,
    sizeMm2: size,
    phase: opts.phase,
    conductor: opts.conductor,
  });
  const protection = nextBreaker(derated);
  return {
    current,
    suggestedSize: size,
    voltageDrop: drop,
    voltageDropPct: (drop / opts.voltage) * 100,
    suggestedProtection: `${protection} A`,
  };
}

function nextBreaker(amps: number) {
  const ratings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400, 630, 800];
  return ratings.find((r) => r >= amps) ?? Math.ceil(amps);
}

export function generatorKva(loadKw: number, pf = 0.8, diversity = 1.25) {
  return (loadKw * diversity) / pf;
}

export function transformerKva(loadKw: number, pf = 0.8, growth = 1.2) {
  return (loadKw * growth) / pf;
}

export function upsKva(loadKw: number, pf = 0.9, redundancy = 1.25) {
  return (loadKw * redundancy) / pf;
}

export function capacitorKvar(loadKw: number, fromPf: number, toPf: number) {
  const phi1 = Math.acos(fromPf);
  const phi2 = Math.acos(toPf);
  return loadKw * (Math.tan(phi1) - Math.tan(phi2));
}

export function energyKwh(loadKw: number, hours: number, days: number) {
  return loadKw * hours * days;
}
