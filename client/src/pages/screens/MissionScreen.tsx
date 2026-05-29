import { useState, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import {
  ScreenWrap, MilCard, MilButton, NPCDialog, MilTag, GradeBadge, ProgressBar, Divider,
} from '../../components/GameUI';
import {
  DIFFS, CHARS, makeScenario, class1Vals, fuelVals, ammoVals, finalVals,
  grade, parseNum, fmtN, ceilN, passThresholdForDifficulty, type Scenario,
} from '../../lib/gameData';
import { missionCreditReward, shuffleWithSeed } from '../../lib/gameplayUtils';
import { toast } from 'sonner';
import { useState as useChaosState } from 'react';
import { ChaosOverlay, AchievementToast, useChaosTrigger, ChaosMeter } from '../../components/ChaosOverlay';
import type { ChaosEvent } from '../../lib/gameData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Choice {
  text: string;
  score: number;
  effects: Record<string, number>;
  result: string;
  learn: string;
  correct?: boolean;
}

interface Field {
  id: string;
  label: string;
  expected: number | string;
  tol?: number;
  type?: 'number' | 'text';
  allow?: string[];
  hint?: string;
}

interface Step {
  kind: 'choice' | 'input' | 'info';
  speaker: string;
  loc: string;
  text: string;
  choices?: Choice[];
  fields?: Field[];
  learn?: string;
  score?: number;
}

// ─── Mission Builder ──────────────────────────────────────────────────────────

function buildMissions(s: Scenario): { id: string; name: string; color: string; steps: Step[] }[] {
  const c1 = class1Vals(s);
  const fv = fuelVals(s);
  const av = ammoVals(s);
  const final = finalVals(s);

  function ch(text: string, score: number, effects: Record<string, number>, result: string, learn: string, correct = false): Choice {
    return { text, score, effects, result, learn, correct };
  }
  function fld(id: string, label: string, expected: number, tol = 0, hint?: string): Field {
    return { id, label, expected, tol, type: 'number', hint };
  }
  function fldTxt(id: string, label: string, expected: string, allow: string[], hint?: string): Field {
    return { id, label, expected, allow, type: 'text', hint };
  }

  return [
    {
      id: 'm1', name: 'WARNO DROP', color: 'cyan',
      steps: [
        {
          kind: 'choice', speaker: 'xo', loc: 'BATTALION HQ — 0630',
          text: `495 CSSB has received a mission to support 1-163 Infantry during Operation Flathead Shield. H-hour is ${s.hHour}. The commander wants initial sustainment options fast. What is your FIRST action?`,
          score: 12,
          choices: [
            ch('Ask for mission, timeline, commander priorities, and issue an initial WARNO.', 12, { clarity: 8, cmd: 4 }, 'You buy subordinate planning time and start the staff in the right direction.', 'Receipt of mission is about time, priorities, and immediate warning to subordinates.', true),
            ch('Start building slides immediately.', -6, { clarity: -7, chaos: 5 }, 'The slide looks nice. It answers almost nothing.', 'Pretty slides do not replace mission analysis.'),
            ch('Tell everyone we are tracking and wait for more info.', -8, { tempo: -5, cmd: -6 }, 'Tracking is not an action. The clock keeps running.', 'A staff buys time early or loses it forever.'),
            ch('Call the supported unit for clarification before doing anything.', 4, { clarity: 3 }, 'Reasonable, but the WARNO should still go out immediately.', 'Clarification and WARNO issuance happen in parallel, not sequentially.'),
          ],
        },
        {
          kind: 'input', speaker: 'system', loc: 'TIME ANALYSIS',
          text: `Mission received at 0600. H-hour is ${s.hHour}. Apply the 1/3 - 2/3 rule. Enter hours as whole numbers.`,
          fields: [
            fld('total', 'Total hours available before H-hour', Math.round((s.hHour / 100) - 6), 0, 'H-hour time minus receipt time'),
            fld('unit', 'Hours the battalion keeps for planning (1/3)', Math.round(((s.hHour / 100) - 6) / 3), 1, 'Total ÷ 3'),
            fld('sub', 'Hours subordinates receive (2/3)', Math.round(((s.hHour / 100) - 6) * 2 / 3), 1, 'Total × 2/3'),
          ],
          learn: 'The 1/3 - 2/3 rule protects subordinate planning time. It is one of the simplest ways a staff can help subordinate units.',
          score: 24,
        },
        {
          kind: 'choice', speaker: 'csm', loc: 'CSM CHECK',
          text: 'CSM Good asks what you are worried about before the first staff huddle.',
          score: 12,
          choices: [
            ch('Bad assumptions: personnel count, route status, drivers, and water.', 12, { clarity: 7, readiness: 5 }, 'CSM nods. You identified what can break the plan early.', 'Assumptions deserve aggressive verification.', true),
            ch('Mostly whether the slides have enough graphics.', -6, { chaos: 6, cmd: -4 }, 'CPT PowerPoint smiles. Everyone else gets nervous.', 'Graphics support decisions. They do not make decisions.'),
            ch('Nothing. The mission seems straightforward.', -10, { readiness: -10 }, 'The Broken Assumption laughs somewhere in the distance.', 'Simple missions become complex when conditions change.'),
            ch('Whether we have enough coffee for the planning session.', 2, { morale: 3, clarity: -2 }, 'CSM Good approves of the coffee concern. Slightly.', 'Morale matters, but assumptions matter more.'),
          ],
        },
      ],
    },
    {
      id: 'm2', name: 'MISSION ANALYSIS LAB', color: 'purple',
      steps: [
        {
          kind: 'choice', speaker: 's1', loc: 'S1 DESK',
          text: `CPT Schaack and SFC Bailey have conflicting numbers. Initial report says ${s.initial}. New PERSTAT may show ${s.personnel}. What do you do?`,
          choices: [
            ch('Ask S1 to verify boots-on-ground and late arrivals before calculations.', 12, { clarity: 10, coord: 4 }, 'SFC Bailey confirms the updated number and notes late arrivals.', 'Personnel is the base variable for Class I, water, and driver feasibility.', true),
            ch(`Use the old number: ${s.initial}.`, -8, { readiness: -10 }, 'Your downstream estimates are now short.', 'Outdated personnel data contaminates every sustainment estimate.'),
            ch('Use the biggest number but do not verify it.', 2, { clarity: -2 }, 'Better than under-planning, but still lazy staff work.', 'Buffers help, but verification matters.'),
            ch('Average the two numbers.', -4, { clarity: -5 }, 'Averaging unverified data is not analysis.', 'Verify the number. Do not average your way to a wrong answer.'),
          ],
        },
        {
          kind: 'input', speaker: 'system', loc: 'RUNNING ESTIMATE CHECK',
          text: 'Enter the verified planning variables from the staff huddle.',
          fields: [
            fld('pers', 'Confirmed personnel strength', s.personnel, 0, 'From verified PERSTAT'),
            fld('drivers', 'Qualified drivers available', s.driverAvail, 0, 'From S4 vehicle roster'),
            fld('trucks', 'FMC cargo trucks available', s.fmcCargo, 0, 'From maintenance status'),
            fldTxt('pace', 'Primary pacing commodity', 'water', ['water', 'class i', 'class 1', 'class i water'], 'What runs out first?'),
          ],
          learn: 'A running estimate is not a tracker. It is the staff section\'s current understanding of what matters.',
          score: 32,
        },
        {
          kind: 'choice', speaker: 'gibson', loc: 'TAG DRIVE-BY',
          text: 'MG Gibson appears briefly, looks at the board, and says: "Be brilliant at the basics." What does that mean for your planning?',
          choices: [
            ch('Confirm facts, identify assumptions, and keep the recommendation simple.', 12, { clarity: 8, cmd: 5 }, 'The basics work. The staff gets calmer.', 'Brilliance at the basics is not a slogan. It is a planning discipline.', true),
            ch('Add a fifth COA just in case.', -6, { chaos: 8 }, 'More options without more understanding creates noise.', 'Complexity without clarity is not sophistication.'),
            ch('Ask CPT PowerPoint to make the board look more professional.', -8, { clarity: -8 }, 'The board becomes prettier and less useful.', 'The commander needs understanding, not decoration.'),
            ch('Brief the general on everything you know so far.', -4, { tempo: -5 }, 'The general wanted to observe, not be briefed.', 'Read the room. Sometimes the best action is to keep working.'),
          ],
        },
      ],
    },
    {
      id: 'm3', name: 'CLASS I AND WATER', color: 'green',
      steps: [
        {
          kind: 'input', speaker: 'spo', loc: 'MAJ CANTRELL\'S WHITEBOARD',
          text: `MAJ Cantrell wants real math. Personnel: ${s.personnel}. Duration: ${c1.days} days. Meals: 3 per soldier per day. MRE case: 12 meals. Reserve: 15%.`,
          fields: [
            fld('meals', 'Total meals required', c1.meals, 0, `${s.personnel} × 3 × ${c1.days}`),
            fld('cases', 'MRE cases before reserve', c1.cases, 0, 'Total meals ÷ 12, round up'),
            fld('casesRes', 'MRE cases with 15% reserve', c1.casesRes, 0, 'Cases × 1.15, round up'),
            fld('pallets', 'MRE pallets required', c1.pallets, 0, 'Cases with reserve ÷ 48, round up'),
          ],
          learn: 'Always calculate meals first, then cases, then pallets. Round up at packaging steps.',
          score: 44,
        },
        {
          kind: 'input', speaker: 'spo', loc: 'WATER UPDATE',
          text: `Water rate: 3 gallons per Soldier per day. Personnel: ${s.personnel}. Duration: ${c1.days} days. Add 15% reserve.`,
          fields: [
            fld('water', 'Base water gallons', c1.waterBase, 0, `${s.personnel} × 3 × ${c1.days}`),
            fld('waterR', 'Water gallons with 15% reserve', c1.waterRes, 0, 'Base × 1.15, round up'),
          ],
          learn: 'Water is often the pacing commodity because distribution capacity is harder than storage capacity.',
          score: 22,
        },
        {
          kind: 'choice', speaker: 'kyle', loc: 'MATH CHECK',
          text: 'CPT Kyle Meadlee glances at your board and asks: "When do you round?"',
          choices: [
            ch('Round up cases and gallons when packaging or delivery requires whole units.', 10, { clarity: 4, readiness: 5 }, 'Kyle nods. "Never round down what soldiers need."', 'Rounding down creates artificial shortages.', true),
            ch('Round down because the number is close.', -12, { readiness: -12 }, 'Kyle calmly circles the mistake in red.', 'Close enough is not enough for sustainment math.'),
            ch('Round to the nearest whole number.', -6, { readiness: -6 }, 'Rounding to nearest can round down. That is a shortage.', 'For sustainment, always round up. Never round down.'),
            ch('Only round at the final answer.', -4, { clarity: -3 }, 'Rounding errors compound when you wait.', 'Round up at each packaging step to prevent cascading shortages.'),
          ],
        },
      ],
    },
    {
      id: 'm4', name: 'FUEL AND CONVOY', color: 'orange',
      steps: [
        {
          kind: 'input', speaker: 's4', loc: 'CPT BERGET\'S FUEL BOARD',
          text: `Route one-way distance: ${s.oneWay} miles. Round trip required. Trips: ${s.trips}. Vehicles: 3 PLS @ 6 MPG, 2 LMTV @ 8 MPG, 1 HMMWV @ 12 MPG, 1 fueler @ 7 MPG. Add 20% reserve.`,
          fields: [
            fld('rt', 'Round-trip distance (miles)', fv.rt, 0, `${s.oneWay} × 2`),
            fld('plsMiles', 'PLS vehicle-miles total', fv.plsMiles, 0, `3 × ${fv.rt} × ${s.trips}`),
            fld('plsFuel', 'PLS fuel gallons', Math.round(fv.pls), 2, 'PLS miles ÷ 6'),
            fld('base', 'Total base fuel gallons (all vehicles)', Math.round(fv.base), 2, 'Sum all vehicle fuel'),
            fld('reserve', 'Total fuel with 20% reserve', fv.reserve, 2, 'Base × 1.20, round up'),
          ],
          learn: 'Fuel is vehicle miles divided by MPG. Calculate each vehicle type separately. Add 20% reserve.',
          score: 50,
        },
        {
          kind: 'choice', speaker: 's3', loc: 'MOVEMENT DECISION',
          text: 'CPT Whitehead and MSG Benz ask if the convoy should launch immediately.',
          choices: [
            ch('Confirm route, PACE, load plan, and driver status before SP.', 12, { coord: 7, cmd: 4 }, 'You protect tempo by preventing rework. MSG Benz approves silently.', 'PCC/PCI before SP prevents avoidable failure.', true),
            ch('Launch now. Fix details on the road.', -12, { chaos: 12, readiness: -10 }, 'The road is a terrible place to discover missing details.', 'Urgency is not an excuse to skip critical checks.'),
            ch('Delay until every variable is perfect.', -8, { tempo: -12, cmd: -4 }, 'The mission moves without your perfect plan.', 'Staff work manages imperfect information.'),
            ch('Send a small advance element to check the route first.', 8, { clarity: 5, tempo: -3 }, 'Smart, but it costs time. Balance reconnaissance with tempo.', 'Route reconnaissance is valuable when time allows.'),
          ],
        },
        {
          kind: 'choice', speaker: 's2', loc: 'WEATHER BRIEF',
          text: `LT Gary reports a weather delay of ${s.weatherDelay} minutes possible due to rain. Route status: ${s.routeStatus}. How does this affect your plan?`,
          choices: [
            ch('Update SP time, notify supported unit, and add weather delay to time analysis.', 14, { clarity: 8, coord: 6 }, 'S2 nods. The plan absorbs the change.', 'Weather and terrain are planning variables, not surprises.', true),
            ch('Ignore it. Weather reports are often wrong.', -10, { chaos: 8, readiness: -6 }, 'The rain arrives on schedule. Your plan does not.', 'S2 analysis exists to prevent this exact outcome.'),
            ch('Cancel the mission until weather clears.', -8, { tempo: -10, cmd: -5 }, 'The supported unit is now unsupported.', 'Weather is a planning factor, not a mission stopper.'),
            ch('Brief the commander and ask for guidance.', 10, { cmd: 6, clarity: 4 }, 'Good instinct. Commander adjusts the timeline.', 'Surfacing weather risk to the commander is correct staff action.'),
          ],
        },
      ],
    },
    {
      id: 'm5', name: 'CLASS V AND DODAC', color: 'red',
      steps: [
        {
          kind: 'input', speaker: 'spo', loc: 'CLASS V CELL',
          text: `Ammo request: 420 M4 shooters × 40 rounds. 80 M249 shooters × 120 rounds linked 5.56. 50 M240 shooters × 150 rounds linked 7.62. 30 M320 shooters × 6 rounds. Add 10% reserve.`,
          fields: [
            fld('loose', '5.56 loose rounds (M4)', av.loose, 0, '420 × 40'),
            fld('linked556', '5.56 linked rounds (M249)', av.linked556, 0, '80 × 120'),
            fld('linked762', '7.62 linked rounds (M240)', av.linked762, 0, '50 × 150'),
            fld('forty', '40mm rounds (M320)', av.forty, 0, '30 × 6'),
          ],
          learn: 'Separate ammunition by type. 5.56 loose and 5.56 linked are not the same planning line.',
          score: 40,
        },
        {
          kind: 'input', speaker: 'kyle', loc: 'AMMO RESERVE',
          text: 'CPT Kyle Meadlee asks for reserve quantities. Add 10% and round up.',
          fields: [
            fld('looseR', '5.56 loose with 10% reserve', av.looseR, 0, 'Loose × 1.10, round up'),
            fld('linked556R', '5.56 linked with 10% reserve', av.linked556R, 0, 'Linked 5.56 × 1.10'),
            fld('linked762R', '7.62 linked with 10% reserve', av.linked762R, 0, 'Linked 7.62 × 1.10'),
            fld('fortyR', '40mm with 10% reserve', av.fortyR, 0, '40mm × 1.10'),
          ],
          learn: 'Reserve is applied after the base requirement. Do not blend ammo types or round down.',
          score: 40,
        },
        {
          kind: 'choice', speaker: 'spo', loc: 'DODAC CHECK',
          text: 'MAJ Cantrell asks what makes the ammo estimate dangerous if done incorrectly.',
          choices: [
            ch('Mixing loose and linked ammo under a generic "5.56" label.', 14, { clarity: 9, readiness: 6 }, 'Correct. The category matters because packaging, issue, and range use differ.', 'DODAC discipline prevents wrong ammunition from arriving.', true),
            ch('Using too much whiteboard space.', -4, { morale: 2 }, 'That is annoying, not dangerous.', 'A messy board is fixable. Wrong ammo is harder.'),
            ch('Briefing the number before checking packaging.', 5, { clarity: 2 }, 'Partially right. Packaging matters, but type separation comes first.', 'Type, quantity, packaging, transport: all matter.'),
            ch('Not having enough decimal places.', -6, { clarity: -3 }, 'Ammo is counted in whole rounds. Decimals are not the issue.', 'The issue is type separation, not precision.'),
          ],
        },
      ],
    },
    {
      id: 'm6', name: 'LOGPAC LOADMASTER', color: 'cyan',
      steps: [
        {
          kind: 'input', speaker: 's4', loc: 'MOTOR POOL LOAD PLAN',
          text: 'Cargo: Water 9 pallets, MREs 5 pallets, Ammo 4 pallets, Batteries 1 pallet, Maintenance parts 1 pallet. Vehicles: PLS 1 = 8 pallets, PLS 2 = 8 pallets, LMTV 1 = 2 pallets, LMTV 2 = 2 pallets.',
          fields: [
            fld('cargo', 'Total cargo pallets', 20, 0, 'Sum all cargo types'),
            fld('capacity', 'Total vehicle capacity (pallets)', 20, 0, 'Sum all vehicle capacities'),
            fldTxt('lift', 'Is one lift sufficient? (yes/no)', 'yes', ['yes', 'y'], 'Cargo ≤ Capacity?'),
          ],
          learn: 'A plan that fits exactly has no flexibility. One NMC vehicle breaks the plan.',
          score: 30,
        },
        {
          kind: 'choice', speaker: 'spo', loc: 'LOAD PRIORITY',
          text: 'One LMTV goes NMC. Capacity drops to 18 pallets. What do you do?',
          choices: [
            ch('Prioritize water and ammo, delay lower-priority maintenance parts, and brief the shortfall.', 18, { cmd: 8, readiness: 8, clarity: 6 }, 'You preserve the mission and tell the commander what changed.', 'Priority of support drives load decisions under constraint.', true),
            ch('Overload the PLS by two pallets.', -16, { chaos: 12, readiness: -12 }, 'The convoy commander objects loudly.', 'Capacity limits are not suggestions.'),
            ch('Cancel the LOGPAC.', -12, { tempo: -15, cmd: -8 }, 'You eliminated convoy risk by creating mission risk.', 'Risk management is not risk avoidance.'),
            ch('Wait for the LMTV to be repaired.', -6, { tempo: -8 }, 'The delivery window closes while you wait.', 'Manage the constraint. Do not wait for perfection.'),
          ],
        },
        {
          kind: 'choice', speaker: 'snedigar', loc: 'CHAOS EVENT',
          text: 'PVT Snedigar appears pushing a handcart full of mystery boxes and accidentally clips your ankle.',
          choices: [
            ch('Recover, ask what is in the boxes, and update the load plan.', 10, { morale: 4, clarity: 4 }, 'The boxes contain radio batteries that S6 actually needed. Chaos becomes information.', 'Ground truth often comes from the person physically moving the stuff.', true),
            ch('Yell and ignore the boxes.', -7, { chaos: 7, coord: -5 }, 'The batteries vanish into the motor pool ecosystem.', 'Anger is not inventory control.'),
            ch('Let SFC Ray handle it.', 6, { chaos: -6 }, 'SFC Ray whispers, "The secret ingredient is crime," and the boxes are suddenly labeled.', 'Ray solves consequences, not doctrine.'),
            ch('Document the incident for the safety officer.', 2, { clarity: 1 }, 'Thorough. But the batteries still need to be accounted for.', 'Documentation and action are not mutually exclusive.'),
          ],
        },
      ],
    },
    {
      id: 'm7', name: 'PACE AND LOGSTAT', color: 'purple',
      steps: [
        {
          kind: 'input', speaker: 's6', loc: 'PACE PLAN',
          text: 'LT Drinville reports FM dead zone near LRP Eagle, unreliable cell coverage, delayed JBC-P, runner available, SAT phone at TOC. Enter a reasonable PACE plan.',
          fields: [
            fldTxt('p', 'Primary', 'fm', ['fm', 'fm radio', 'logistics net', 'radio'], 'Best available method'),
            fldTxt('a', 'Alternate', 'jbc-p', ['jbcp', 'jbc-p', 'jbc p', 'jbc'], 'Different from primary'),
            fldTxt('c', 'Contingency', 'sat phone', ['sat', 'sat phone', 'satphone', 'cell/sat', 'cell', 'satellite'], 'Works when both fail'),
            fldTxt('e', 'Emergency', 'runner', ['runner', 'prearranged check-in', 'check in', 'check-in', 'visual'], 'Last resort — always available'),
          ],
          learn: 'PACE only works if the alternate methods are actually different and available.',
          score: 48,
        },
        {
          kind: 'input', speaker: 'spo', loc: 'LOGSTAT DETECTIVE',
          text: `Company A reports water 40%. Company B reports water 70%. SPO tracker says green. Convoy delivered 1,200 gallons. Personnel increased to ${s.finalPersonnel}.`,
          fields: [
            fldTxt('verify', 'First number to verify', 'personnel', ['personnel', 'boots on ground', 'headcount', 'strength', 'pax'], 'What changed?'),
            fldTxt('green', 'Should water remain green? (yes/no)', 'no', ['no', 'n', 'negative'], 'Check the math'),
            fldTxt('brief', 'Primary issue to brief to commander', 'water distribution', ['water', 'water distribution', 'consumption', 'distribution'], 'What is the real problem?'),
          ],
          learn: 'LOGSTAT is not self-interpreting. A green tracker can hide changed assumptions.',
          score: 36,
        },
        {
          kind: 'choice', speaker: 'bc', loc: 'COMMANDER UPDATE',
          text: 'LTC Figarelle asks, "Where is the fragility in your communication architecture?"',
          choices: [
            ch('FM dead zone near LRP Eagle, mitigated by JBC-P, SAT/cell contingency, and check-in windows.', 14, { cmd: 10, clarity: 8 }, 'The BC likes the precision. Big words avoided. Meaning delivered.', 'Commanders need the risk, mitigation, and trigger.', true),
            ch('Sir, S6 is tracking.', -14, { cmd: -12, clarity: -10 }, 'The BC stares through your soul.', '"Tracking" is not a mitigation.'),
            ch('Comms are probably fine.', -18, { cmd: -15, readiness: -8 }, 'The Comms Phantom smiles.', 'Probability without basis is hope.'),
            ch('I will get back to you after checking with S6.', 4, { cmd: -2, clarity: 2 }, 'Better than guessing, but you should already know this.', 'Know your PACE plan before the commander asks.'),
          ],
        },
      ],
    },
    {
      id: 'm8', name: 'COA WARGAME', color: 'gold',
      steps: [
        {
          kind: 'input', speaker: 'bc', loc: 'COA COMPARISON BOARD',
          text: 'LTC Figarelle says: "Brief me the stratification of risk." COA 1 scores: Reliability 3, Risk 2, Flexibility 2, Simplicity 5, Efficiency 4. Weights: 30%, 20%, 20%, 15%, 15%.',
          fields: [
            fld('coa1', 'COA 1 weighted score', 3.05, 0.03, '(3×.30)+(2×.20)+(2×.20)+(5×.15)+(4×.15)'),
          ],
          learn: 'Weighted matrices are tools. They do not replace judgment, but they organize it.',
          score: 18,
        },
        {
          kind: 'input', speaker: 'bc', loc: 'COA COMPARISON BOARD',
          text: 'COA 2 scores: Reliability 4, Risk 4, Flexibility 5, Simplicity 3, Efficiency 3. Same weights: 30%, 20%, 20%, 15%, 15%.',
          fields: [
            fld('coa2', 'COA 2 weighted score', 3.90, 0.03, '(4×.30)+(4×.20)+(5×.20)+(3×.15)+(3×.15)'),
          ],
          learn: 'COA 2 wins if flexibility and reliability matter more than simplicity.',
          score: 18,
        },
        {
          kind: 'choice', speaker: 'ppt', loc: 'RIVAL STAFF OFFICER',
          text: 'CPT PowerPoint offers to spend the last 15 minutes animating the COA matrix with gradients and a rotating truck icon.',
          choices: [
            ch('Decline and build a recommendation slide with risk, mitigation, and decision needed.', 16, { clarity: 10, cmd: 7 }, 'CPT PowerPoint looks wounded but the brief improves.', 'A decision brief needs a decision.', true),
            ch('Accept. Add gradients and a rotating truck icon.', -14, { clarity: -12, chaos: 8 }, 'It is beautiful and useless.', 'Design cannot rescue weak analysis.'),
            ch('Add one more COA so the matrix looks fuller.', -10, { chaos: 10 }, 'More COAs. Less understanding.', 'COAs must be distinguishable and useful.'),
            ch('Ask CPT Cho what he thinks.', 8, { clarity: 5 }, 'Cho says: "What decision does the commander need?" Good question.', 'Seeking analysis input is good. Avoiding the decision is not.'),
          ],
        },
        {
          kind: 'choice', speaker: 'cho', loc: 'CHO OPTION',
          text: 'CPT Deil Cho quietly asks, "What decision do you need from the commander?"',
          choices: [
            ch('Approve COA 2 as base plan with COA 3 as emergency branch and authorize LRP Eagle.', 18, { cmd: 12, clarity: 10, coord: 6 }, 'The Cho Option appears. The matrix finally becomes a recommendation.', 'The best staff action turns analysis into a commander decision.', true),
            ch('Ask the commander which COA he likes best without recommendation.', -8, { cmd: -7 }, 'That is not staff work. That is outsourcing thinking.', 'Staff provides recommendations, not just choices.'),
            ch('Brief all COAs equally and avoid taking a position.', -12, { clarity: -10, cmd: -5 }, 'Neutrality sounds safe. It is not useful.', 'The commander needs informed judgment.'),
            ch('Recommend COA 1 because it has the highest simplicity score.', -4, { clarity: -3 }, 'Simplicity alone is not the criterion. The weighted score matters.', 'Use the full weighted analysis, not just one criterion.'),
          ],
        },
      ],
    },
    {
      id: 'm9', name: 'FRAGORD AND OPORD', color: 'lime',
      steps: [
        {
          kind: 'input', speaker: 's3', loc: 'ORDERS PRODUCTION',
          text: 'Build the order. Enter the correct OPORD paragraph (1-Situation, 2-Mission, 3-Execution, 4-Sustainment, 5-Command and Signal) for each item.',
          fields: [
            fldTxt('lrp', 'LRP location paragraph', 'sustainment', ['sustainment', '4', 'para 4', 'paragraph 4'], 'Where do logistics go?'),
            fldTxt('pace', 'PACE plan paragraph', 'command and signal', ['command and signal', 'command signal', 'signal', '5', 'para 5', 'paragraph 5'], 'Where does comms go?'),
            fldTxt('sp', 'LOGPAC SP time paragraph', 'execution', ['execution', '3', 'para 3', 'paragraph 3'], 'Where do timelines go?'),
            fldTxt('casevac', 'CASEVAC reporting paragraph', 'sustainment', ['sustainment', '4', 'para 4', 'paragraph 4'], 'Where does medical go?'),
          ],
          learn: 'Orders production turns the approved COA into executable tasks. Put information where subordinates can find it.',
          score: 40,
        },
        {
          kind: 'input', speaker: 'xo', loc: 'FRAGORD UPDATE',
          text: `FRAGORD: 1-163 extends to ${s.durationDays + 1} days. Route Moose closes after 1400 — divert to Route Elk. One ${s.nmc} is NMC. LOGSTAT every 6 hours. Enter updated planning values.`,
          fields: [
            fld('days', 'Updated mission duration in days', s.durationDays + 1, 0, 'Original + 1'),
            fld('logstat', 'LOGSTAT interval in hours', 6, 0, 'As directed by FRAGORD'),
            fldTxt('route', 'Primary alternate route after closure', 'route elk', ['route elk', 'elk', 'alternate route'], 'What is the alternate?'),
          ],
          learn: 'A FRAGORD changes the plan and the math. Update the order, not just the tracker.',
          score: 30,
        },
        {
          kind: 'choice', speaker: 'system', loc: 'PRINTER JAM BOSS',
          text: 'The OPORD is complete. The printer has other plans. It is jammed. Again.',
          choices: [
            ch('Publish digitally, confirm receipt, and print critical hard copies only.', 14, { tempo: 8, coord: 5 }, 'The printer loses. The order gets out.', 'The point is shared understanding, not paper volume.', true),
            ch('Print 47 copies again.', -10, { tempo: -12, chaos: 6 }, 'The printer smells fear.', 'Repetition without adaptation is not persistence.'),
            ch('Delay the order until the printer feels ready.', -14, { cmd: -8, tempo: -15 }, 'The mission does not wait for office equipment.', 'Orders must be issued in time to matter.'),
            ch('Ask PVT Snedigar to fix the printer.', 4, { chaos: 4, morale: 3 }, 'Snedigar fixes it. Somehow. Do not ask how.', 'Sometimes the right person for the job is unexpected.'),
          ],
        },
      ],
    },
    {
      id: 'm10', name: 'MDMP NIGHTMARE FINAL', color: 'red',
      steps: [
        {
          kind: 'input', speaker: 'bc', loc: 'FINAL SUSTAINMENT ESTIMATE',
          text: `Final scenario. Personnel: ${s.finalPersonnel}. Duration: ${final.days} days. Meals 3/day. MRE case 12 meals. 48 cases/pallet. Water ${s.waterRate} gal/Soldier/day with 15% reserve.`,
          fields: [
            fld('meals', 'Total meals', final.meals, 0, `${s.finalPersonnel} × 3 × ${final.days}`),
            fld('cases', 'MRE cases', final.cases, 0, 'Meals ÷ 12, round up'),
            fld('pallets', 'MRE pallets', final.pallets, 0, 'Cases ÷ 48, round up'),
            fld('water', 'Water gallons with 15% reserve', final.waterRes, 0, `${s.finalPersonnel} × ${s.waterRate} × ${final.days} × 1.15`),
          ],
          learn: 'The final problem chains personnel, duration, packaging, and reserve. One bad base number breaks the whole estimate.',
          score: 52,
        },
        {
          kind: 'input', speaker: 'spo', loc: 'FINAL CLASS III / CLASS V',
          text: `Final fuel and ammo. Use final fuel plan with 3 trips and 20% fuel reserve. Ammo request increased by ${s.ammoBoost}%.`,
          fields: [
            fld('fuel', 'Fuel gallons with 20% reserve', final.fuel, 2, 'Vehicle miles ÷ MPG × 1.20'),
            fld('loose', '5.56 loose with increase', final.loose, 0, `Base × (1 + ${s.ammoBoost}/100)`),
            fld('l556', '5.56 linked with increase', final.linked556, 0, `Linked 5.56 × (1 + ${s.ammoBoost}/100)`),
            fld('l762', '7.62 linked with increase', final.linked762, 0, `Linked 7.62 × (1 + ${s.ammoBoost}/100)`),
          ],
          learn: 'When demand changes, update by type. Do not apply a generic increase to a blended ammo pile.',
          score: 52,
        },
        {
          kind: 'input', speaker: 's4', loc: 'FINAL LIFT / DRIVER FEASIBILITY',
          text: `Cargo pallets and drivers. Take your MRE pallets from the sustainment estimate, palletize water at 500 gallons per pallet (round up), and add 10 pallets of misc cargo (ammo, batteries, parts). Total available lift capacity: ${final.cap} pallets per lift. Major vehicles requiring crews: 3 PLS + 2 LMTV + 1 fueler = 6, at 2 drivers each. Available drivers: ${s.driverAvail}.`,
          fields: [
            fld('totalPallets', 'Total cargo pallets', final.totalPallets, 2, 'MRE pallets + ⌈water ÷ 500⌉ + 10 misc'),
            fld('tripsReq', 'Trips required to move all cargo', final.tripsReq, 0, `Total pallets ÷ ${final.cap}, round up`),
            fld('driversReq', 'Drivers required for full convoy', final.driversReq, 0, '6 major vehicles × 2 drivers'),
            fld('driverDelta', 'Driver surplus/deficit', final.driverDelta, 0, `${s.driverAvail} - required`),
          ],
          learn: 'Feasibility is binary. Either you have enough drivers or you do not. The math tells you which.',
          score: 52,
        },
        {
          kind: 'choice', speaker: 'bc', loc: 'FINAL BRIEF',
          text: 'LTC Figarelle says: "Give me your recommendation. One sentence."',
          choices: [
            ch(`Recommend COA 2: ${final.tripsReq} lifts, ${final.driversReq} drivers required, shortfall of ${Math.abs(Math.min(0, final.driverDelta))} drivers — request augmentation.`, 20, { cmd: 15, clarity: 12 }, 'The BC nods. "That is staff work."', 'A recommendation includes the decision, the risk, and the ask.', true),
            ch('Sir, we are still analyzing.', -20, { cmd: -18, clarity: -15 }, 'The BC has heard this before. He is not impressed.', 'Analysis without recommendation is not staff work.'),
            ch('Sir, all COAs are viable.', -15, { cmd: -12, clarity: -10 }, 'The BC stares. "Then why did I pay for a staff?"', 'If all COAs are viable, you have not analyzed them.'),
            ch('Sir, I recommend we wait for more information.', -10, { cmd: -8, tempo: -8 }, 'The commander needed a decision, not a delay.', 'The staff\'s job is to reduce uncertainty, not to wait for certainty.'),
          ],
        },
      ],
    },
  ];
}

function getStepMax(step: Step) {
  if (typeof step.score === 'number') return step.score;
  if (step.choices?.length) {
    const bestCorrect = Math.max(...step.choices.filter(c => c.correct).map(c => Math.max(0, c.score)), 0);
    const bestAny = Math.max(...step.choices.map(c => Math.max(0, c.score)), 0);
    return bestCorrect || bestAny;
  }
  return 0;
}

function getMissionMax(mission: { steps: Step[] }) {
  return mission.steps.reduce((sum, st) => sum + getStepMax(st), 0);
}

// ─── Mission Screen Component ─────────────────────────────────────────────────

export default function MissionScreen() {
  const { state, dispatch, getScenario } = useGame();
  const s = getScenario();
  const missions = buildMissions(s);
  const mission = missions[state.missionIndex];
  const step = mission?.steps[state.stepIndex];
  const diff = DIFFS[state.difficulty];

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [inputResults, setInputResults] = useState<Record<string, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [choiceResult, setChoiceResult] = useState<{ choice: Choice; index: number } | null>(null);
  const [missionScore, setMissionScore] = useState(state.scores[mission?.id] || 0);
  const inputRef = useRef<HTMLDivElement>(null);
  const [activeChaosEvent, setActiveChaosEvent] = useState<ChaosEvent | null>(null);
  const [pendingAchievement, setPendingAchievement] = useState<{ name: string; emoji: string; desc: string } | null>(null);
  const { shouldTrigger, getRandomEvent } = useChaosTrigger(state.chaosMeter, false);

  // Cosmetic comments
  const COSMETIC_COMMENTS: Record<string, string> = {
    iron_man_mustache: '"Looking sharp, soldier. Very Stark." — CPT Berget',
    funny_hat: '"The stratification of risk inherent in that headgear is... considerable." — LTC Figarelli',
    aviator_glasses: '"You look like a pilot. You are not a pilot." — SGM',
    beret: '"Now THAT is a beret. Morale improved." — Staff',
    coffee_mug: '"Morale improved. Carry on." — Everyone',
    whiteboard_marker: '"Does it have ink? Please tell me it has ink." — S3',
  };

  useEffect(() => {
    setInputValues({});
    setInputResults({});
    setSubmitted(false);
    setChoiceResult(null);
  }, [state.missionIndex, state.stepIndex]);

  useEffect(() => {
    setMissionScore(state.scores[mission?.id] || 0);
  }, [mission?.id, state.scores]);

  const choiceAttempt = mission ? (state.missions[mission.id]?.attempts || 0) : 0;
  const visibleChoices = useMemo(
    () => step?.choices
      ? shuffleWithSeed(step.choices, `${state.challenge}:${mission?.id}:${state.stepIndex}:${state.difficulty}:${choiceAttempt}`)
      : [],
    [choiceAttempt, mission?.id, state.challenge, state.difficulty, state.stepIndex, step],
  );

  if (!mission || !step) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-500 mono">Mission not found.</div>
        </div>
      </ScreenWrap>
    );
  }

  const totalSteps = mission.steps.length;
  const isLastStep = state.stepIndex >= totalSteps - 1;

  function handleChoice(choice: Choice, idx: number) {
    if (choiceResult) return;
    setChoiceResult({ choice, index: idx });

    const score = Math.max(0, choice.score);
    dispatch({ type: 'ADD_MISSION_SCORE', missionId: mission.id, score, max: getStepMax(step) });
    dispatch({ type: 'APPLY_EFFECTS', effects: choice.effects as any });
    dispatch({ type: 'SPEND_TIME', minutes: 4 });
    setMissionScore(prev => prev + score);

    if (choice.correct) {
      dispatch({ type: 'ADD_STREAK' });
      dispatch({ type: 'ADD_XP', amount: 15 });
      // Reduce chaos slightly on correct answer
      dispatch({ type: 'REDUCE_CHAOS', amount: 3 });
      toast.success('Correct! +' + score + ' pts');
    } else {
      dispatch({ type: 'RESET_STREAK' });
      // Wrong answer increases chaos
      const chaosAdd = state.difficulty === 'nightmare' || state.difficulty === 'qual' ? 20 : diff.hard ? 15 : 10;
      dispatch({ type: 'ADD_CHAOS', amount: chaosAdd });
      if (choice.score < 0) toast.error('Wrong call. ' + choice.result);
      // Maybe trigger chaos event
      if (shouldTrigger(30)) {
        const evt = getRandomEvent();
        if (evt) {
          setTimeout(() => setActiveChaosEvent(evt), 800);
          // Apply chaos event effect
          if (evt.effect === 'xp-10') dispatch({ type: 'ADD_XP', amount: -10 });
          if (evt.effect === 'creds-15') dispatch({ type: 'SPEND_CREDS', amount: 15 });
          if (evt.effect === 'time-5') dispatch({ type: 'SPEND_TIME', minutes: 5 });
          if (evt.effect === 'chaos+10') dispatch({ type: 'ADD_CHAOS', amount: 10 });
          if (evt.effect === 'chaos+15') dispatch({ type: 'ADD_CHAOS', amount: 15 });
          if (evt.effect === 'chaos+20') dispatch({ type: 'ADD_CHAOS', amount: 20 });
          // Snedigar hit is handled in ChaosOverlay via event id
        }
      }
    }

    // SFC Ray saves wrong answer
    if (!choice.correct && state.rayCards > 0 && !diff.noSaves) {
      dispatch({ type: 'USE_ITEM', itemId: 'ray_card' });
      toast.info('🕶️ SFC Ray walks in and quietly gives you the right answer. "The secret ingredient is crime."');
    }

    // Cosmetic comment
    if (state.activeCosmeticId && COSMETIC_COMMENTS[state.activeCosmeticId] && Math.random() < 0.3) {
      toast.info(COSMETIC_COMMENTS[state.activeCosmeticId]);
    }

    dispatch({ type: 'ADD_NOTEBOOK', title: `${mission.name} — ${step.loc}`, text: `Choice: ${choice.text}\nResult: ${choice.result}\nLesson: ${choice.learn}` });
  }

  function handleInputSubmit() {
    if (!step.fields || submitted) return;
    const results: Record<string, boolean> = {};
    let correct = 0;
    const lines: string[] = [];
    const saves: string[] = [];

    for (const f of step.fields) {
      const raw = inputValues[f.id] || '';
      let ok = false;

      if (f.type === 'number') {
        const n = parseNum(raw);
        const tol = f.tol || 0;
        ok = Number.isFinite(n) && Math.abs(n - Number(f.expected)) <= tol;
      } else {
        const v = String(raw).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        ok = (f.allow || [String(f.expected)]).some(a => v === String(a).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim());
      }

      // Save cards
      if (!ok && !diff.noSaves) {
        if (state.rayCards > 0) {
          dispatch({ type: 'USE_ITEM', itemId: 'ray_card' });
          ok = true;
          saves.push('🕶️ SFC Ray saved one entry.');
        } else if (state.mercyCards > 0) {
          dispatch({ type: 'USE_ITEM', itemId: 'mercy' });
          ok = true;
          saves.push('🃏 Mercy Card corrected one entry.');
        } else if (state.e4 && Math.random() < 0.35) {
          ok = true;
          saves.push('🤝 E4 Mafia quietly fixed one number.');
        }
      }

      results[f.id] = ok;
      if (ok) correct++;
      const expected = f.type === 'number' ? fmtN(Number(f.expected)) : String(f.expected);
      lines.push(`${ok ? '✓' : '✗'} ${f.label}: entered ${raw || '(blank)'} | expected ${expected}`);
    }

    const pct = correct / step.fields.length;
    const score = Math.round((step.score || 30) * pct);

    setInputResults(results);
    setSubmitted(true);

    dispatch({ type: 'ADD_MISSION_SCORE', missionId: mission.id, score, max: getStepMax(step) });

    dispatch({ type: 'APPLY_EFFECTS', effects: pct === 1 ? { clarity: 8, readiness: 6, cmd: 3 } : pct >= 0.7 ? { clarity: 3, readiness: 1 } : { clarity: -8, readiness: -8, chaos: 8, cmd: -4 } });
    dispatch({ type: 'SPEND_TIME', minutes: 6 + step.fields.length * 2 });
    dispatch({ type: 'ADD_XP', amount: Math.round(score / 2) });
    setMissionScore(prev => prev + score);

    if (pct === 1) {
      dispatch({ type: 'ADD_STREAK' });
      toast.success(`Perfect! All ${step.fields.length} correct. +${score} pts`);
    } else if (pct >= 0.7) {
      toast.info(`${correct}/${step.fields.length} correct. +${score} pts`);
    } else {
      dispatch({ type: 'RESET_STREAK' });
      dispatch({ type: 'ADD_CHAOS', amount: state.difficulty === 'nightmare' || state.difficulty === 'qual' ? 18 : diff.hard ? 12 : 8 });
      toast.error(`${correct}/${step.fields.length} correct. Review the formulas.`);
    }

    if (saves.length) saves.forEach(s => toast.info(s));
    dispatch({ type: 'ADD_NOTEBOOK', title: `${mission.name} — ${step.loc}`, text: lines.join('\n') + (saves.length ? '\n\n' + saves.join('\n') : '') });
  }

  function handleNext() {
    if (isLastStep) {
      // Complete mission
      const finalScore = missionScore;
      const maxScore = getMissionMax(mission);
      const pct = maxScore > 0 ? finalScore / maxScore : 0;
      const weightedPoints = Math.round(finalScore * diff.mult);
      const creditsEarned = missionCreditReward(finalScore, diff.mult);
      dispatch({ type: 'COMPLETE_MISSION', missionId: mission.id, score: finalScore, max: maxScore });
      dispatch({ type: 'ADD_CREDS', amount: creditsEarned });
      dispatch({ type: 'ADD_XP', amount: 50 });
      if (pct >= 1) {
        dispatch({ type: 'ADD_ACHIEVEMENT', achievement: {
          id: 'perfect_mission',
          name: 'No Errors',
          desc: 'Complete a mission with a perfect score.',
          emoji: '⭐',
          earnedAt: Date.now(),
        }});
        dispatch({ type: 'ADD_BADGE', badge: {
          id: `perfect_${mission.id}`,
          name: `${mission.name} Perfect`,
          desc: 'Every decision and calculation was correct.',
          emoji: '⭐',
          earnedAt: Date.now(),
        }});
      }
      if (mission.id === 'm10' && pct >= 0.9) {
        dispatch({ type: 'ADD_ACHIEVEMENT', achievement: {
          id: 'nightmare_final',
          name: 'MDMP Nightmare Graduate',
          desc: 'Earn Gold on the final MDMP qualification mission.',
          emoji: '🏆',
          earnedAt: Date.now(),
        }});
      }
      dispatch({ type: 'SET_LAST_RESULT', result: {
        title: 'MISSION AAR',
        isAAR: true,
        choice: mission.name,
        result: `Score: ${finalScore}/${maxScore}\nGrade: ${grade(finalScore, maxScore)}\nDifficulty: ${diff.name} x${diff.mult}\nPass gate: ${Math.round(passThresholdForDifficulty(state.difficulty) * 100)}%\nLeaderboard points: ${weightedPoints}\nCredits earned: ${creditsEarned}`,
        learn: grade(finalScore, maxScore) === 'GOLD'
          ? 'You tied facts to a commander decision. That is staff work. The 495th CSSB is the premier CSSB.'
          : 'Replay to improve. Validate assumptions, do the math, and brief a recommendation.',
        score: finalScore,
        effects: {},
        missionId: mission.id,
        missionIndex: state.missionIndex,
        grade: grade(finalScore, maxScore),
        max: maxScore,
        missionScore: finalScore,
      }});
      dispatch({ type: 'SET_SCREEN', screen: 'result' });
    } else {
      dispatch({ type: 'SET_STEP_INDEX', index: state.stepIndex + 1 });
    }
  }

  const canProceed = step.kind === 'choice' ? !!choiceResult : submitted;

  return (
    <ScreenWrap>
      {/* Chaos Event Overlay */}
      {activeChaosEvent && (
        <ChaosOverlay
          event={activeChaosEvent}
          onDismiss={() => setActiveChaosEvent(null)}
        />
      )}
      {/* Achievement Toast */}
      {pendingAchievement && (
        <AchievementToast
          achievement={pendingAchievement}
          onDismiss={() => setPendingAchievement(null)}
        />
      )}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Mission Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono hover:text-slate-300 transition-colors">
            ← HUB
          </button>
          <div className="flex-1">
            <ProgressBar value={state.stepIndex} max={totalSteps} label={`${mission.name} — Step ${state.stepIndex + 1}/${totalSteps}`} />
          </div>
          <span className="text-xs text-yellow-400 mono font-bold">{missionScore} pts</span>
        </div>

        {/* Step Header */}
        <div className={`mil-card mil-card-${mission.color} p-4 mb-4 animate-fade-in`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 mono">{step.loc}</span>
            <div className="flex gap-2">
              <MilTag color={mission.color}>MISSION {state.missionIndex + 1}</MilTag>
              <MilTag color="cyan">STEP {state.stepIndex + 1}</MilTag>
            </div>
          </div>
          {/* Chaos meter inline */}
          <div className="mt-2">
            <ChaosMeter value={state.chaosMeter} />
          </div>
        </div>

        {/* Vehicle & Scenario Data Panel (always visible for reference) */}
        <details className="mb-4">
          <summary className="text-xs text-cyan-400/70 mono cursor-pointer hover:text-cyan-400 transition-colors">
            📊 SCENARIO DATA (click to expand for reference)
          </summary>
          <div className="mt-2 bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 text-xs">
            <div className="text-[10px] text-cyan-400/60 mono tracking-widest mb-3">// ACTIVE SCENARIO: {s.code}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <div><div className="text-slate-600 mono text-[10px]">PERSONNEL</div><div className="text-cyan-300 mono font-bold">{s.personnel}</div></div>
              <div><div className="text-slate-600 mono text-[10px]">DURATION</div><div className="text-cyan-300 mono font-bold">{s.durationDays} days</div></div>
              <div><div className="text-slate-600 mono text-[10px]">H-HOUR</div><div className="text-cyan-300 mono font-bold">{s.hHour}</div></div>
              <div><div className="text-slate-600 mono text-[10px]">ONE-WAY DIST</div><div className="text-cyan-300 mono font-bold">{s.oneWay} mi</div></div>
              <div><div className="text-slate-600 mono text-[10px]">TRIPS</div><div className="text-cyan-300 mono font-bold">{s.trips}</div></div>
              <div><div className="text-slate-600 mono text-[10px]">ROUTE STATUS</div><div className="text-yellow-300 mono font-bold text-[10px]">{s.routeStatus}</div></div>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <div className="text-[10px] text-slate-500 mono mb-2">VEHICLE FLEET</div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-white font-bold mono">{s.hemtt}</div>
                  <div className="text-[9px] text-slate-500">HEMTT</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-white font-bold mono">{s.lmtvTotal}</div>
                  <div className="text-[9px] text-slate-500">LMTV</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-white font-bold mono">{s.plsTotal}</div>
                  <div className="text-[9px] text-slate-500">PLS</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-white font-bold mono">{s.hmmwvTotal}</div>
                  <div className="text-[9px] text-slate-500">HMMWV</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-white font-bold mono">{s.fuelersTotal}</div>
                  <div className="text-[9px] text-slate-500">FUELER</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-red-400 mono">NMC: {s.nmc}</span>
                <span className="text-[10px] text-slate-600">|</span>
                <span className="text-[10px] text-slate-500 mono">FMC Cargo: {s.fmcCargo}</span>
                <span className="text-[10px] text-slate-600">|</span>
                <span className="text-[10px] text-cyan-400 mono font-bold">Qualified Drivers: {s.driverAvail}</span>
                {state.e4FavorUsed && <span className="text-[10px] text-lime-400 mono">| E4 Mafia: +1 FMC</span>}
              </div>
            </div>
          </div>
        </details>

        {/* NPC Dialog */}
        <NPCDialog charId={step.speaker} text={step.text} location={step.loc} />

        {/* Difficulty hint */}
        {diff.hard && (
          <div className="warn-box mb-4">
            ⚠️ {diff.name}: No formula hints. {diff.noSaves ? 'No save cards.' : 'Save cards still work.'} Use the scenario data and reference materials.
          </div>
        )}

        {/* CHOICE STEP */}
        {step.kind === 'choice' && step.choices && (
          <div className="animate-fade-in-up">
            <div className="text-xs text-slate-600 mono mb-3">// SELECT YOUR ACTION</div>
            {visibleChoices.map((c, i) => {
              const isSelected = choiceResult?.index === i;
              const isCorrect = choiceResult && c.correct && choiceResult.index === i;
              const isWrong = choiceResult && choiceResult.index === i && !c.correct;
              const isRevealedCorrect = choiceResult && c.correct && choiceResult.index !== i;

              return (
                <button
                  key={i}
                  onClick={() => handleChoice(c, i)}
                  disabled={!!choiceResult}
                  className={`choice-btn ${isCorrect ? 'correct' : isWrong ? 'wrong' : isRevealedCorrect ? 'correct opacity-60' : ''}`}
                >
                  <span className="text-xs text-slate-500 mono mr-2">{String.fromCharCode(65 + i)}.</span>
                  {c.text}
                </button>
              );
            })}

            {choiceResult && (
              <div className={`mt-4 animate-fade-in-up ${choiceResult.choice.correct ? 'success-box' : 'danger-box'}`}>
                <div className="font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {choiceResult.choice.correct ? '✓ CORRECT' : '✗ WRONG CALL'}
                </div>
                <p className="mb-2">{choiceResult.choice.result}</p>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <span className="text-xs font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>TEACHING POINT: </span>
                  <span className="text-xs">{choiceResult.choice.learn}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INPUT STEP */}
        {step.kind === 'input' && step.fields && (
          <div className="animate-fade-in-up" ref={inputRef}>
            <div className="text-xs text-slate-600 mono mb-3">// ENTER YOUR CALCULATIONS</div>
            <div className="grid gap-4 mb-4">
              {step.fields.map(f => (
                <div key={f.id}>
                  <label className="block text-xs text-slate-400 mb-1.5 mono">{f.label}</label>
                  {diff.hints && f.hint && !submitted && (
                    <div className="text-[10px] text-cyan-400/60 mono mb-1">💡 {f.hint}</div>
                  )}
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    value={inputValues[f.id] || ''}
                    onChange={e => setInputValues(prev => ({ ...prev, [f.id]: e.target.value }))}
                    disabled={submitted}
                    className={`mil-input ${submitted ? (inputResults[f.id] ? 'correct' : 'wrong') : ''}`}
                    placeholder={f.type === 'number' ? '0' : 'Enter answer...'}
                  />
                  {submitted && (
                    <div className={`text-xs mt-1 mono ${inputResults[f.id] ? 'text-emerald-400' : 'text-red-400'}`}>
                      {inputResults[f.id] ? '✓ Correct' : `✗ Expected: ${f.type === 'number' ? fmtN(Number(f.expected)) : f.expected}`}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!submitted && (
              <MilButton color="cyan" className="w-full" onClick={handleInputSubmit}>
                SUBMIT CALCULATIONS
              </MilButton>
            )}

            {submitted && step.learn && (
              <div className="info-box mt-4 animate-fade-in-up">
                <div className="font-bold mb-1 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>TEACHING POINT</div>
                <p className="text-xs">{step.learn}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {canProceed && (
          <div className="mt-6 animate-fade-in-up">
            <Divider />
            <MilButton color={isLastStep ? 'gold' : 'cyan'} size="lg" className="w-full" onClick={handleNext}>
              {isLastStep ? '🏁 COMPLETE MISSION' : '→ NEXT STEP'}
            </MilButton>
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}
