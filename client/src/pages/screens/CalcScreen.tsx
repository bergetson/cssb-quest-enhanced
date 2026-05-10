import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, MilCard, MilButton, Divider } from '../../components/GameUI';

function ceilN(n: number) { return Math.ceil(n); }
function fmtN(n: number) { return Number.isFinite(n) ? n.toLocaleString() : '—'; }

export default function CalcScreen() {
  const { dispatch } = useGame();
  const [tab, setTab] = useState<'class1' | 'water' | 'fuel' | 'ammo' | 'time'>('class1');

  // Class I
  const [c1Pers, setC1Pers] = useState('');
  const [c1Days, setC1Days] = useState('');
  const [c1Res, setC1Res] = useState('15');
  const c1Meals = Number(c1Pers) * 3 * Number(c1Days);
  const c1Cases = ceilN(c1Meals / 12);
  const c1CasesRes = ceilN(c1Cases * (1 + Number(c1Res) / 100));
  const c1Pallets = ceilN(c1CasesRes / 48);

  // Water
  const [wPers, setWPers] = useState('');
  const [wDays, setWDays] = useState('');
  const [wRate, setWRate] = useState('3');
  const [wRes, setWRes] = useState('15');
  const wBase = Number(wPers) * Number(wRate) * Number(wDays);
  const wTotal = ceilN(wBase * (1 + Number(wRes) / 100));

  // Fuel
  const [fDist, setFDist] = useState('');
  const [fTrips, setFTrips] = useState('1');
  const [fRes, setFRes] = useState('20');
  const [fVehicles, setFVehicles] = useState([
    { name: 'PLS', count: '0', mpg: '6' },
    { name: 'LMTV', count: '0', mpg: '8' },
    { name: 'HMMWV', count: '0', mpg: '12' },
    { name: 'Fueler', count: '0', mpg: '7' },
    { name: 'Custom', count: '0', mpg: '10' },
  ]);
  const fRT = Number(fDist) * 2;
  const fBase = fVehicles.reduce((sum, v) => sum + (Number(v.count) * fRT * Number(fTrips)) / Number(v.mpg), 0);
  const fTotal = ceilN(fBase * (1 + Number(fRes) / 100));

  // Ammo
  const [aShooters556, setAShooters556] = useState('');
  const [aRate556, setARate556] = useState('40');
  const [aShooters556L, setAShooters556L] = useState('');
  const [aRate556L, setARate556L] = useState('120');
  const [aShooters762, setAShooters762] = useState('');
  const [aRate762, setARate762] = useState('150');
  const [aShooters40, setAShooters40] = useState('');
  const [aRate40, setARate40] = useState('6');
  const [aRes, setARes] = useState('10');
  const aLoose = ceilN(Number(aShooters556) * Number(aRate556) * (1 + Number(aRes) / 100));
  const aLinked556 = ceilN(Number(aShooters556L) * Number(aRate556L) * (1 + Number(aRes) / 100));
  const aLinked762 = ceilN(Number(aShooters762) * Number(aRate762) * (1 + Number(aRes) / 100));
  const a40mm = ceilN(Number(aShooters40) * Number(aRate40) * (1 + Number(aRes) / 100));

  // Time Analysis
  const [tReceived, setTReceived] = useState('0600');
  const [tHHour, setTHHour] = useState('1800');
  function parseTime(t: string) {
    const h = parseInt(t.slice(0, 2) || '0');
    const m = parseInt(t.slice(2) || '0');
    return h * 60 + m;
  }
  const tRecMin = parseTime(tReceived);
  const tHHMin = parseTime(tHHour);
  const tTotal = Math.max(0, tHHMin - tRecMin);
  const tCmd = Math.floor(tTotal / 3);
  const tSub = tTotal - tCmd;
  function minsToHHMM(m: number) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h}h ${min}m`;
  }

  const tabs = [
    { id: 'class1', label: 'CLASS I', emoji: '🍱' },
    { id: 'water', label: 'WATER', emoji: '💧' },
    { id: 'fuel', label: 'FUEL', emoji: '⛽' },
    { id: 'ammo', label: 'AMMO', emoji: '💥' },
    { id: 'time', label: 'TIME', emoji: '⏱️' },
  ] as const;

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <SectionTitle color="green">SPO CALCULATOR</SectionTitle>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                tab === t.id
                  ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-400'
                  : 'border-white/8 bg-white/2 text-slate-500 hover:text-slate-300'
              }`}
              style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.06em' }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* CLASS I */}
        {tab === 'class1' && (
          <div className="animate-fade-in-up">
            <MilCard className="p-5 mb-4">
              <div className="text-xs text-green-400/80 mono tracking-widest mb-4">// CLASS I — SUBSISTENCE</div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">PERSONNEL</label>
                    <input type="number" value={c1Pers} onChange={e => setC1Pers(e.target.value)} className="mil-input" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">DAYS</label>
                    <input type="number" value={c1Days} onChange={e => setC1Days(e.target.value)} className="mil-input" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 mono">RESERVE %</label>
                  <input type="number" value={c1Res} onChange={e => setC1Res(e.target.value)} className="mil-input" />
                </div>
              </div>
            </MilCard>

            {c1Meals > 0 && (
              <div className="output-box animate-fade-in-up">
                <div className="text-xs text-green-400/80 mono tracking-widest mb-3">// RESULTS</div>
                <div className="grid gap-2">
                  {[
                    ['Total Meals', fmtN(c1Meals), `${c1Pers} × 3 × ${c1Days}`],
                    ['MRE Cases (base)', fmtN(ceilN(c1Meals / 12)), `⌈${fmtN(c1Meals)} ÷ 12⌉`],
                    [`MRE Cases (+${c1Res}% reserve)`, fmtN(c1CasesRes), `⌈${fmtN(ceilN(c1Meals / 12))} × ${1 + Number(c1Res) / 100}⌉`],
                    ['MRE Pallets', fmtN(c1Pallets), `⌈${fmtN(c1CasesRes)} ÷ 48⌉`],
                  ].map(([label, val, formula]) => (
                    <div key={label} className="flex items-center justify-between gap-2 py-1 border-b border-white/5">
                      <div>
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="text-[10px] text-slate-600 mono">{formula}</div>
                      </div>
                      <div className="text-lg font-black text-green-400 mono">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WATER */}
        {tab === 'water' && (
          <div className="animate-fade-in-up">
            <MilCard className="p-5 mb-4">
              <div className="text-xs text-cyan-400/80 mono tracking-widest mb-4">// WATER PLANNING</div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">PERSONNEL</label>
                    <input type="number" value={wPers} onChange={e => setWPers(e.target.value)} className="mil-input" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">DAYS</label>
                    <input type="number" value={wDays} onChange={e => setWDays(e.target.value)} className="mil-input" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">RATE (gal/Soldier/day)</label>
                    <input type="number" value={wRate} onChange={e => setWRate(e.target.value)} className="mil-input" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">RESERVE %</label>
                    <input type="number" value={wRes} onChange={e => setWRes(e.target.value)} className="mil-input" />
                  </div>
                </div>
              </div>
            </MilCard>
            {wBase > 0 && (
              <div className="output-box animate-fade-in-up">
                <div className="text-xs text-cyan-400/80 mono tracking-widest mb-3">// RESULTS</div>
                <div className="grid gap-2">
                  {[
                    ['Base Water (gallons)', fmtN(wBase), `${wPers} × ${wRate} × ${wDays}`],
                    [`With ${wRes}% Reserve`, fmtN(wTotal), `⌈${fmtN(wBase)} × ${1 + Number(wRes) / 100}⌉`],
                  ].map(([label, val, formula]) => (
                    <div key={label} className="flex items-center justify-between gap-2 py-1 border-b border-white/5">
                      <div>
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="text-[10px] text-slate-600 mono">{formula}</div>
                      </div>
                      <div className="text-lg font-black text-cyan-400 mono">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FUEL */}
        {tab === 'fuel' && (
          <div className="animate-fade-in-up">
            <MilCard className="p-5 mb-4">
              <div className="text-xs text-orange-400/80 mono tracking-widest mb-4">// FUEL PLANNING</div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">ONE-WAY DISTANCE (mi)</label>
                    <input type="number" value={fDist} onChange={e => setFDist(e.target.value)} className="mil-input" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 mono">TRIPS</label>
                    <input type="number" value={fTrips} onChange={e => setFTrips(e.target.value)} className="mil-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 mono">RESERVE %</label>
                  <input type="number" value={fRes} onChange={e => setFRes(e.target.value)} className="mil-input" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mono mb-2">VEHICLES</div>
                  <div className="grid gap-2">
                    {fVehicles.map((v, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-xs text-slate-400">{v.name}</span>
                        <input
                          type="number"
                          value={v.count}
                          onChange={e => setFVehicles(prev => prev.map((vv, ii) => ii === i ? { ...vv, count: e.target.value } : vv))}
                          className="mil-input text-center"
                          placeholder="count"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={v.mpg}
                            onChange={e => setFVehicles(prev => prev.map((vv, ii) => ii === i ? { ...vv, mpg: e.target.value } : vv))}
                            className="mil-input text-center"
                            placeholder="mpg"
                          />
                          <span className="text-[10px] text-slate-600">mpg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </MilCard>
            {fBase > 0 && (
              <div className="output-box animate-fade-in-up">
                <div className="text-xs text-orange-400/80 mono tracking-widest mb-3">// RESULTS</div>
                <div className="grid gap-2">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <div><div className="text-xs text-slate-400">Round Trip Distance</div><div className="text-[10px] text-slate-600 mono">{fDist} × 2</div></div>
                    <div className="text-lg font-black text-orange-400 mono">{fmtN(fRT)} mi</div>
                  </div>
                  {fVehicles.filter(v => Number(v.count) > 0).map(v => {
                    const vFuel = (Number(v.count) * fRT * Number(fTrips)) / Number(v.mpg);
                    return (
                      <div key={v.name} className="flex justify-between py-1 border-b border-white/5">
                        <div><div className="text-xs text-slate-400">{v.name} ({v.count} × {v.mpg} mpg)</div></div>
                        <div className="text-sm font-bold text-orange-300 mono">{fmtN(Math.round(vFuel))} gal</div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <div><div className="text-xs text-slate-400">Base Fuel Total</div></div>
                    <div className="text-lg font-black text-orange-400 mono">{fmtN(Math.round(fBase))} gal</div>
                  </div>
                  <div className="flex justify-between py-1">
                    <div><div className="text-xs text-slate-400">With {fRes}% Reserve</div></div>
                    <div className="text-xl font-black text-yellow-400 mono">{fmtN(fTotal)} gal</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AMMO */}
        {tab === 'ammo' && (
          <div className="animate-fade-in-up">
            <MilCard className="p-5 mb-4">
              <div className="text-xs text-red-400/80 mono tracking-widest mb-4">// AMMUNITION PLANNING</div>
              <div className="grid gap-4">
                {[
                  { label: '5.56 LOOSE (M4)', shooters: aShooters556, setShooters: setAShooters556, rate: aRate556, setRate: setARate556 },
                  { label: '5.56 LINKED (M249)', shooters: aShooters556L, setShooters: setAShooters556L, rate: aRate556L, setRate: setARate556L },
                  { label: '7.62 LINKED (M240)', shooters: aShooters762, setShooters: setAShooters762, rate: aRate762, setRate: setARate762 },
                  { label: '40MM (M320)', shooters: aShooters40, setShooters: setAShooters40, rate: aRate40, setRate: setARate40 },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-xs text-slate-500 mono mb-2">{f.label}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={f.shooters} onChange={e => f.setShooters(e.target.value)} className="mil-input" placeholder="shooters" />
                      <input type="number" value={f.rate} onChange={e => f.setRate(e.target.value)} className="mil-input" placeholder="rounds each" />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 mono">RESERVE %</label>
                  <input type="number" value={aRes} onChange={e => setARes(e.target.value)} className="mil-input" />
                </div>
              </div>
            </MilCard>
            {(Number(aShooters556) + Number(aShooters556L) + Number(aShooters762) + Number(aShooters40)) > 0 && (
              <div className="output-box animate-fade-in-up">
                <div className="text-xs text-red-400/80 mono tracking-widest mb-3">// RESULTS (with {aRes}% reserve)</div>
                <div className="grid gap-2">
                  {[
                    ['5.56 Loose (M4)', aLoose],
                    ['5.56 Linked (M249)', aLinked556],
                    ['7.62 Linked (M240)', aLinked762],
                    ['40mm (M320)', a40mm],
                  ].filter(([, v]) => Number(v) > 0).map(([label, val]) => (
                    <div key={label} className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-lg font-black text-red-400 mono">{fmtN(Number(val))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIME ANALYSIS */}
        {tab === 'time' && (
          <div className="animate-fade-in-up">
            <MilCard className="p-5 mb-4">
              <div className="text-xs text-yellow-400/80 mono tracking-widest mb-4">// TIME ANALYSIS (1/3 — 2/3 RULE)</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 mono">RECEIPT TIME (HHMM)</label>
                  <input type="text" value={tReceived} onChange={e => setTReceived(e.target.value)} className="mil-input" placeholder="0600" maxLength={4} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 mono">H-HOUR (HHMM)</label>
                  <input type="text" value={tHHour} onChange={e => setTHHour(e.target.value)} className="mil-input" placeholder="1800" maxLength={4} />
                </div>
              </div>
            </MilCard>
            {tTotal > 0 && (
              <div className="output-box animate-fade-in-up">
                <div className="text-xs text-yellow-400/80 mono tracking-widest mb-3">// TIME ANALYSIS RESULTS</div>
                <div className="grid gap-2">
                  {[
                    ['Total Available Time', minsToHHMM(tTotal), `${tHHour} - ${tReceived}`],
                    ['Commander\'s Time (1/3)', minsToHHMM(tCmd), `${tTotal} ÷ 3`],
                    ['Subordinate Time (2/3)', minsToHHMM(tSub), `${tTotal} × 2/3`],
                  ].map(([label, val, formula]) => (
                    <div key={label} className="flex items-center justify-between gap-2 py-1 border-b border-white/5">
                      <div>
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="text-[10px] text-slate-600 mono">{formula}</div>
                      </div>
                      <div className="text-lg font-black text-yellow-400 mono">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="info-box mt-3">
                  <div className="text-xs">Issue WARNO immediately. Issue OPORD no later than <span className="text-yellow-400 font-bold mono">{minsToHHMM(tCmd)}</span> after receipt.</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}
