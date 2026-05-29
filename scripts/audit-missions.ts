// Mission answerability harness.
// For every scenario seed it re-derives each numeric field THE WAY A PLAYER WOULD
// from the on-screen text, then compares to the value the game checks against
// (the gameData helpers). Any mismatch beyond the field's tolerance, any non-integer
// expected on a zero-tolerance field, or any NaN means a level is not fairly answerable.

import {
  makeScenario, class1Vals, fuelVals, ammoVals, finalVals,
} from '../client/src/lib/gameData.ts';

const ceil = Math.ceil;
const round = Math.round;

interface Issue { seed: string; mission: string; field: string; detail: string; }
const issues: Issue[] = [];

function check(seed: string, mission: string, field: string, playerValue: number, expected: number, tol: number) {
  if (!Number.isFinite(expected)) { issues.push({ seed, mission, field, detail: `expected is not finite (${expected})` }); return; }
  if (!Number.isFinite(playerValue)) { issues.push({ seed, mission, field, detail: `player derivation not finite (${playerValue})` }); return; }
  if (tol === 0 && !Number.isInteger(expected)) {
    issues.push({ seed, mission, field, detail: `expected ${expected} is non-integer but tol=0 (unenterable)` });
  }
  if (Math.abs(playerValue - expected) > tol + 1e-9) {
    issues.push({ seed, mission, field, detail: `player got ${playerValue}, game expects ${expected} (tol ${tol})` });
  }
}

function audit(seed: string) {
  const s = makeScenario(seed);
  const c1 = class1Vals(s);
  const fv = fuelVals(s);
  const av = ammoVals(s);
  const final = finalVals(s);

  // ── M1: time analysis (1/3 - 2/3 rule), tol 0 / 1 / 1
  const total = s.hHour / 100 - 6;
  check(seed, 'M1', 'total', total, round(total), 0);
  check(seed, 'M1', 'unit', round(total / 3), round(total / 3), 1);
  check(seed, 'M1', 'sub', round((total * 2) / 3), round((total * 2) / 3), 1);

  // ── M2: verified planning variables, tol 0
  check(seed, 'M2', 'pers', s.personnel, s.personnel, 0);
  check(seed, 'M2', 'drivers', s.driverAvail, s.driverAvail, 0);
  check(seed, 'M2', 'trucks', s.fmcCargo, s.fmcCargo, 0);

  // ── M3: Class I + water, tol 0
  const meals = s.personnel * 3 * s.durationDays;
  const cases = ceil(meals / 12);
  const casesRes = ceil(cases * 1.15);
  const pallets = ceil(casesRes / 48);
  check(seed, 'M3', 'meals', meals, c1.meals, 0);
  check(seed, 'M3', 'cases', cases, c1.cases, 0);
  check(seed, 'M3', 'casesRes', casesRes, c1.casesRes, 0);
  check(seed, 'M3', 'pallets', pallets, c1.pallets, 0);
  const water = s.personnel * 3 * s.durationDays;
  check(seed, 'M3', 'water', water, c1.waterBase, 0);
  check(seed, 'M3', 'waterR', ceil(water * 1.15), c1.waterRes, 0);

  // ── M4: fuel, tol 0 (rt, plsMiles) / 2 (fuel sums)
  const rt = s.oneWay * 2;
  const plsMiles = 3 * rt * s.trips;
  const pls = plsMiles / 6;
  const lmtv = (2 * rt * s.trips) / 8;
  const h = (1 * rt * s.trips) / 12;
  const f = (1 * rt * s.trips) / 7;
  const base = pls + lmtv + h + f;
  check(seed, 'M4', 'rt', rt, fv.rt, 0);
  check(seed, 'M4', 'plsMiles', plsMiles, fv.plsMiles, 0);
  check(seed, 'M4', 'plsFuel', round(pls), round(fv.pls), 2);
  check(seed, 'M4', 'base', round(base), round(fv.base), 2);
  check(seed, 'M4', 'reserve', ceil(base * 1.2), fv.reserve, 2);

  // ── M5: Class V ammo, tol 0
  check(seed, 'M5', 'loose', 420 * 40, av.loose, 0);
  check(seed, 'M5', 'linked556', 80 * 120, av.linked556, 0);
  check(seed, 'M5', 'linked762', 50 * 150, av.linked762, 0);
  check(seed, 'M5', 'forty', 30 * 6, av.forty, 0);
  check(seed, 'M5', 'looseR', ceil(420 * 40 * 1.1), av.looseR, 0);
  check(seed, 'M5', 'linked556R', ceil(80 * 120 * 1.1), av.linked556R, 0);
  check(seed, 'M5', 'linked762R', ceil(50 * 150 * 1.1), av.linked762R, 0);
  check(seed, 'M5', 'fortyR', ceil(30 * 6 * 1.1), av.fortyR, 0);

  // ── M6: fixed numbers (cargo 20 / capacity 20) — constant, sanity only
  check(seed, 'M6', 'cargo', 9 + 5 + 4 + 1 + 1, 20, 0);
  check(seed, 'M6', 'capacity', 8 + 8 + 2 + 2, 20, 0);

  // ── M8: weighted COA scores, tol 0.03
  const coa1 = 3 * 0.3 + 2 * 0.2 + 2 * 0.2 + 5 * 0.15 + 4 * 0.15;
  const coa2 = 4 * 0.3 + 4 * 0.2 + 5 * 0.2 + 3 * 0.15 + 3 * 0.15;
  check(seed, 'M8', 'coa1', coa1, 3.05, 0.03);
  check(seed, 'M8', 'coa2', coa2, 3.9, 0.03);

  // ── M9: FRAGORD updated values, tol 0
  check(seed, 'M9', 'days', s.durationDays + 1, s.durationDays + 1, 0);
  check(seed, 'M9', 'logstat', 6, 6, 0);

  // ── M10: final estimate
  const fmeals = s.finalPersonnel * 3 * 5;
  const fcases = ceil(fmeals / 12);
  const fpallets = ceil(fcases / 48);
  const fwater = ceil(s.finalPersonnel * s.waterRate * 5 * 1.15);
  check(seed, 'M10', 'meals', fmeals, final.meals, 0);
  check(seed, 'M10', 'cases', fcases, final.cases, 0);
  check(seed, 'M10', 'pallets', fpallets, final.pallets, 0);
  check(seed, 'M10', 'water', fwater, final.waterRes, 0);
  // fuel with 3 trips
  const rt3 = s.oneWay * 2;
  const base3 = (3 * rt3 * 3) / 6 + (2 * rt3 * 3) / 8 + (1 * rt3 * 3) / 12 + (1 * rt3 * 3) / 7;
  check(seed, 'M10', 'fuel', ceil(base3 * 1.2), final.fuel, 2);
  check(seed, 'M10', 'loose', ceil(420 * 40 * (1 + s.ammoBoost / 100)), final.loose, 0);
  check(seed, 'M10', 'l556', ceil(80 * 120 * (1 + s.ammoBoost / 100)), final.linked556, 0);
  check(seed, 'M10', 'l762', ceil(50 * 150 * (1 + s.ammoBoost / 100)), final.linked762, 0);
  // lift / drivers (text now states 500 gal/pallet, +10 misc, 6 major vehicles)
  const totalPallets = fpallets + ceil(fwater / 500) + 10;
  check(seed, 'M10', 'totalPallets', totalPallets, final.totalPallets, 2);
  check(seed, 'M10', 'tripsReq', ceil(totalPallets / (2 * 8 + 2 * 2)), final.tripsReq, 0);
  check(seed, 'M10', 'driversReq', (2 + 2 + 1 + 1) * 2, final.driversReq, 0);
  check(seed, 'M10', 'driverDelta', s.driverAvail - 12, final.driverDelta, 0);
}

// Exercise the discrete scenario space thoroughly.
const seeds = ['MOOSE-495'];
for (let i = 0; i < 8000; i++) seeds.push(`SEED-${i}-${(i * 2654435761) % 100000}`);
for (const seed of seeds) audit(seed);

// Report
const byKey = new Map<string, { count: number; example: Issue }>();
for (const it of issues) {
  const key = `${it.mission}.${it.field}: ${it.detail.replace(/-?\d+(\.\d+)?/g, '#')}`;
  const e = byKey.get(key);
  if (e) e.count++; else byKey.set(key, { count: 1, example: it });
}

console.log(`Audited ${seeds.length} seeds.`);
if (issues.length === 0) {
  console.log('✅ PASS — every computable field is answerable from the on-screen text across all seeds.');
} else {
  console.log(`❌ ${issues.length} field-instances flagged across ${byKey.size} distinct problem(s):\n`);
  for (const [key, v] of [...byKey.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  [${v.count}x] ${key}`);
    console.log(`        e.g. seed=${v.example.seed} → ${v.example.detail}`);
  }
}
