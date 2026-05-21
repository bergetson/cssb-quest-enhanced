export type DifficultyLabel = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type OptionEffects = Record<string, number>;

export interface ChoiceOption {
  text: string;
  correct?: boolean;
  points?: number;
  effects?: OptionEffects;
  feedback: string;
}

export interface TrainingAAR {
  sustain: string[];
  improve: string[];
  retrain: string[];
  teachingPoint: string;
}

export interface WarriorGameCard {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: DifficultyLabel;
  playable: boolean;
}

export interface WarriorRound {
  id: string;
  label: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface WarriorScenario {
  id: string;
  gameId: string;
  gameType: 'multipleChoice' | 'sequence' | 'formBuilder' | 'matching';
  title: string;
  category: string;
  difficulty: DifficultyLabel;
  timeLimitSeconds: number;
  scenarioText: string;
  prompt: string;
  rounds?: WarriorRound[];
  sequenceChoices?: string[];
  correctSequence?: string[];
  aar: TrainingAAR;
  tags: string[];
}

export const warriorGames: WarriorGameCard[] = [
  { id: 'medevac', title: '9-Line MEDEVAC Builder', category: 'Medical', description: 'Build a disciplined evacuation request under time pressure.', difficulty: 'Medium', playable: true },
  { id: 'salute', title: 'SALUTE Report Challenge', category: 'Reporting', description: 'Turn observations into a clear Size, Activity, Location, Unit, Time, Equipment report.', difficulty: 'Easy', playable: true },
  { id: 'march', title: 'MARCH Casualty Assessment', category: 'Medical', description: 'Sequence trauma priorities before the clock and casualty trend beat you.', difficulty: 'Medium', playable: true },
  { id: 'convoy-drill', title: 'Convoy Battle Drill Selector', category: 'Convoy', description: 'Pick immediate actions for breakdowns, route blocks, casualties, UAS, and contact.', difficulty: 'Medium', playable: true },
  { id: 'halt-security', title: 'Establish Security at the Halt', category: 'Security', description: 'Build 360 security, accountability, dispersion, and reporting habits.', difficulty: 'Easy', playable: true },
  { id: 'indirect-fire', title: 'React to Indirect Fire', category: 'Battle Drill', description: 'Framework card ready for expanded indirect fire scenarios.', difficulty: 'Medium', playable: false },
  { id: 'grid-plot', title: 'Grid Coordinate Plotting', category: 'Map Skills', description: 'Framework card for grid, distance, and route confidence practice.', difficulty: 'Hard', playable: false },
  { id: 'radio-selector', title: 'Radio Report Selector', category: 'Signal', description: 'Framework card for selecting the right report on the right net.', difficulty: 'Easy', playable: false },
  { id: 'cbrn', title: 'CBRN Reaction Drill', category: 'Protection', description: 'Framework card for basic protective actions and reporting.', difficulty: 'Hard', playable: false },
  { id: 'small-uas', title: 'Small UAS Reaction', category: 'Protection', description: 'Framework card for observation, cover, reporting, and discipline.', difficulty: 'Medium', playable: false },
  { id: 'contact', title: 'React to Contact', category: 'Battle Drill', description: 'Framework card for simple public training decision points.', difficulty: 'Hard', playable: false },
  { id: 'fighting-position', title: 'Hasty Fighting Position Builder', category: 'Fieldcraft', description: 'Framework card for selecting priorities for hasty protection.', difficulty: 'Medium', playable: false },
  { id: 'signals', title: 'Hand and Arm Signals', category: 'Fieldcraft', description: 'Framework card for visual signal recognition and use.', difficulty: 'Easy', playable: false },
  { id: 'weapon-safety', title: 'Weapon Safety / Maintenance Sequence', category: 'Safety', description: 'Framework card for safe handling and maintenance sequencing.', difficulty: 'Easy', playable: false },
];

const medevacLines = ['Line 1 - location', 'Line 2 - radio/call sign', 'Line 3 - patients by precedence', 'Line 4 - special equipment', 'Line 5 - patients by type', 'Line 6 - security', 'Line 7 - marking method', 'Line 8 - nationality/status', 'Line 9 - CBRN/terrain'];

export const warriorScenarios: WarriorScenario[] = [
  {
    id: 'wt-med-001',
    gameId: 'medevac',
    gameType: 'formBuilder',
    title: '9-Line MEDEVAC: Route Aspen',
    category: 'Medical',
    difficulty: 'Medium',
    timeLimitSeconds: 100,
    scenarioText: 'One Soldier has a penetrating leg wound after a rollover near grid 11T MK 12345 67890. Enemy contact is possible. The pickup zone will be marked with VS-17 panel. No CBRN contamination is suspected.',
    prompt: 'Select the best entry for each MEDEVAC line.',
    rounds: [
      { id: 'l1', label: medevacLines[0], prompt: 'Pickup site location', options: ['11T MK 12345 67890', 'Route Aspen checkpoint 4', 'Near the trees'], correctAnswer: '11T MK 12345 67890', explanation: 'Line 1 requires the most precise available pickup location.' },
      { id: 'l3', label: medevacLines[2], prompt: 'Patient precedence', options: ['1 urgent', '1 routine', '2 priority'], correctAnswer: '1 urgent', explanation: 'Penetrating wound with serious bleeding supports urgent evacuation in this training scenario.' },
      { id: 'l5', label: medevacLines[4], prompt: 'Patient type', options: ['1 litter', '1 ambulatory', 'No patients'], correctAnswer: '1 litter', explanation: 'A serious leg wound normally requires litter evacuation.' },
      { id: 'l6', label: medevacLines[5], prompt: 'Pickup site security', options: ['Possible enemy contact', 'No enemy in area', 'Unknown, do not report'], correctAnswer: 'Possible enemy contact', explanation: 'Report the security condition honestly so the evacuation element understands risk.' },
      { id: 'l7', label: medevacLines[6], prompt: 'Marking method', options: ['VS-17 panel', 'Smoke only', 'None'], correctAnswer: 'VS-17 panel', explanation: 'Use the planned marking method from the scenario.' },
    ],
    aar: {
      sustain: ['You used a precise grid location.', 'You identified urgent evacuation and the pickup marking method.'],
      improve: ['Keep all nine lines structured even when you do not have every detail.'],
      retrain: ['Review the purpose of each 9-line MEDEVAC field.'],
      teachingPoint: 'A useful MEDEVAC request is fast, structured, and honest. Report what you know, identify urgent life threats, and do not hide pickup site risk.',
    },
    tags: ['medical', 'medevac', 'radio'],
  },
  {
    id: 'wt-med-002',
    gameId: 'medevac',
    gameType: 'formBuilder',
    title: '9-Line MEDEVAC: Heat Injury',
    category: 'Medical',
    difficulty: 'Easy',
    timeLimitSeconds: 90,
    scenarioText: 'During field training, one Soldier is confused, hot, and unable to walk. You are at 12T QR 44550 90120. Pickup site is secure and marked by IR strobe at night. No special equipment requested.',
    prompt: 'Build the key MEDEVAC lines.',
    rounds: [
      { id: 'l1', label: medevacLines[0], prompt: 'Pickup site location', options: ['12T QR 44550 90120', 'Training Area West', 'The aid station'], correctAnswer: '12T QR 44550 90120', explanation: 'Use a grid when available.' },
      { id: 'l3', label: medevacLines[2], prompt: 'Patient precedence', options: ['1 priority', '1 urgent', '1 routine'], correctAnswer: '1 urgent', explanation: 'Altered mental status with heat injury can be life threatening.' },
      { id: 'l4', label: medevacLines[3], prompt: 'Special equipment', options: ['None', 'Hoist', 'Ventilator'], correctAnswer: 'None', explanation: 'Do not request equipment not supported by the scenario.' },
      { id: 'l6', label: medevacLines[5], prompt: 'Pickup site security', options: ['Secure', 'Enemy troops in area', 'Unknown'], correctAnswer: 'Secure', explanation: 'Report the current security condition.' },
      { id: 'l7', label: medevacLines[6], prompt: 'Marking method', options: ['IR strobe', 'VS-17 panel', 'Green smoke'], correctAnswer: 'IR strobe', explanation: 'Night pickup site marking should match the scenario.' },
    ],
    aar: {
      sustain: ['You matched the evacuation request to observed symptoms.', 'You avoided unsupported equipment requests.'],
      improve: ['Continue practicing concise radio delivery.'],
      retrain: ['Review heat injury response and medical reporting.'],
      teachingPoint: 'Heat injury with confusion is urgent. Cool, monitor, communicate, and move the patient through the right medical channel.',
    },
    tags: ['medical', 'heat', 'medevac'],
  },
  {
    id: 'wt-med-003',
    gameId: 'medevac',
    gameType: 'formBuilder',
    title: '9-Line MEDEVAC: Two Casualties',
    category: 'Medical',
    difficulty: 'Hard',
    timeLimitSeconds: 80,
    scenarioText: 'A vehicle incident creates two casualties at 12T QS 11111 22222. One is litter urgent with chest trauma. One is ambulatory priority. Pickup site is secure, marked by smoke in daylight. No CBRN contamination.',
    prompt: 'Build the key evacuation request.',
    rounds: [
      { id: 'l1', label: medevacLines[0], prompt: 'Pickup site location', options: ['12T QS 11111 22222', 'Main supply route', 'The convoy site'], correctAnswer: '12T QS 11111 22222', explanation: 'Precise pickup location reduces delay.' },
      { id: 'l3', label: medevacLines[2], prompt: 'Patients by precedence', options: ['1 urgent, 1 priority', '2 routine', '1 convenience, 1 urgent'], correctAnswer: '1 urgent, 1 priority', explanation: 'Different casualty severities should be separated by precedence.' },
      { id: 'l5', label: medevacLines[4], prompt: 'Patients by type', options: ['1 litter, 1 ambulatory', '2 ambulatory', '2 litter'], correctAnswer: '1 litter, 1 ambulatory', explanation: 'Report both patient types.' },
      { id: 'l6', label: medevacLines[5], prompt: 'Security', options: ['Secure', 'Enemy in area', 'Unknown'], correctAnswer: 'Secure', explanation: 'The scenario states the site is secure.' },
      { id: 'l9', label: medevacLines[8], prompt: 'CBRN/terrain', options: ['No CBRN contamination', 'Chemical contamination', 'Biological contamination'], correctAnswer: 'No CBRN contamination', explanation: 'Report no contamination when that is the known condition.' },
    ],
    aar: {
      sustain: ['You separated patient precedence correctly.', 'You reported patient type and contamination clearly.'],
      improve: ['Use a calm line-by-line structure when multiple casualties add pressure.'],
      retrain: ['Review patient precedence and patient type reporting.'],
      teachingPoint: 'Multiple casualties require disciplined sorting. Do not let urgency make the report vague.',
    },
    tags: ['medical', 'medevac', 'casualty'],
  },
  {
    id: 'wt-salute-001',
    gameId: 'salute',
    gameType: 'formBuilder',
    title: 'SALUTE: Convoy Observation',
    category: 'Reporting',
    difficulty: 'Easy',
    timeLimitSeconds: 75,
    scenarioText: 'From a secure observation point, you see three tracked vehicles moving east on Route Granite at 1415. Crews wear dark uniforms. The lead vehicle has a large turret and main gun.',
    prompt: 'Categorize the observation into SALUTE fields.',
    rounds: [
      { id: 'size', label: 'Size', prompt: 'How many?', options: ['Three vehicles', 'One squad', 'Unknown aircraft'], correctAnswer: 'Three vehicles', explanation: 'Size captures number of personnel or equipment.' },
      { id: 'activity', label: 'Activity', prompt: 'What are they doing?', options: ['Moving east', 'Refueling', 'Digging positions'], correctAnswer: 'Moving east', explanation: 'Activity is the observed action.' },
      { id: 'location', label: 'Location', prompt: 'Where?', options: ['Route Granite', 'Armory parking lot', 'Unknown'], correctAnswer: 'Route Granite', explanation: 'Location should be as specific as available.' },
      { id: 'time', label: 'Time', prompt: 'When?', options: ['1415', 'Yesterday', 'After dark'], correctAnswer: '1415', explanation: 'Time makes the report usable.' },
      { id: 'equipment', label: 'Equipment', prompt: 'What equipment?', options: ['Tracked vehicles with turret/main gun', 'Civilian sedans', 'Small quadcopters'], correctAnswer: 'Tracked vehicles with turret/main gun', explanation: 'Report equipment you actually observed.' },
    ],
    aar: {
      sustain: ['You separated size, activity, location, time, and equipment.', 'You reported observed facts instead of guesses.'],
      improve: ['Add confidence language if you are unsure of exact model.'],
      retrain: ['Review SALUTE field definitions.'],
      teachingPoint: 'A clear SALUTE report helps the staff understand what happened without forcing the receiver to decode a story.',
    },
    tags: ['salute', 'reporting'],
  },
  {
    id: 'wt-salute-002',
    gameId: 'salute',
    gameType: 'formBuilder',
    title: 'SALUTE: UAS Sighting',
    category: 'Reporting',
    difficulty: 'Medium',
    timeLimitSeconds: 70,
    scenarioText: 'A small quadcopter is hovering above the convoy staging area at 0932. It departs north after two minutes. No markings are visible.',
    prompt: 'Build the disciplined report.',
    rounds: [
      { id: 'size', label: 'Size', prompt: 'How many?', options: ['One small UAS', 'Four aircraft', 'Unknown convoy'], correctAnswer: 'One small UAS', explanation: 'Report the observed count and type.' },
      { id: 'activity', label: 'Activity', prompt: 'Activity', options: ['Hovered over staging area, then departed north', 'Attacked the convoy', 'Landed and delivered cargo'], correctAnswer: 'Hovered over staging area, then departed north', explanation: 'Do not add effects you did not observe.' },
      { id: 'location', label: 'Location', prompt: 'Location', options: ['Convoy staging area', 'Supported unit LRP', 'Unknown city'], correctAnswer: 'Convoy staging area', explanation: 'Report the relevant site.' },
      { id: 'unit', label: 'Unit/Uniform', prompt: 'Unit or marking', options: ['No markings visible', 'Russian army markings', 'Friendly aircraft'], correctAnswer: 'No markings visible', explanation: 'Confidence discipline matters. Unknown is better than guessing.' },
      { id: 'time', label: 'Time', prompt: 'Time', options: ['0932', '1200', 'No time needed'], correctAnswer: '0932', explanation: 'Time anchors the event.' },
    ],
    aar: {
      sustain: ['You kept the report factual.', 'You used unknown/no markings instead of overclaiming.'],
      improve: ['Include direction of travel in activity when it matters.'],
      retrain: ['Review UAS reporting and confidence discipline.'],
      teachingPoint: 'For small UAS, quick observation, cover, and reporting are more useful than dramatic guessing.',
    },
    tags: ['salute', 'uas', 'reporting'],
  },
  {
    id: 'wt-salute-003',
    gameId: 'salute',
    gameType: 'formBuilder',
    title: 'SALUTE: Damaged Bridge',
    category: 'Reporting',
    difficulty: 'Easy',
    timeLimitSeconds: 70,
    scenarioText: 'At 0630, the convoy lead reports the bridge on Route Blue is partially washed out. Two civilian vehicles are stopped nearby. No injuries observed.',
    prompt: 'Turn the observation into a useful report.',
    rounds: [
      { id: 'size', label: 'Size', prompt: 'Size', options: ['Two civilian vehicles and damaged bridge', 'A platoon of tanks', 'Unknown casualties'], correctAnswer: 'Two civilian vehicles and damaged bridge', explanation: 'Size can include equipment and affected objects.' },
      { id: 'activity', label: 'Activity', prompt: 'Activity', options: ['Bridge partially washed out; vehicles stopped', 'Hostile ambush underway', 'Fuel resupply ongoing'], correctAnswer: 'Bridge partially washed out; vehicles stopped', explanation: 'Activity should match observed condition.' },
      { id: 'location', label: 'Location', prompt: 'Location', options: ['Route Blue bridge', 'Route Red checkpoint 2', 'Unknown'], correctAnswer: 'Route Blue bridge', explanation: 'The route feature matters to movement planners.' },
      { id: 'time', label: 'Time', prompt: 'Time', options: ['0630', '1800', 'No time reported'], correctAnswer: '0630', explanation: 'Report when the observation was made.' },
      { id: 'equipment', label: 'Equipment', prompt: 'Equipment', options: ['Civilian vehicles', 'Air defense system', 'Tracked artillery'], correctAnswer: 'Civilian vehicles', explanation: 'Report the visible equipment without inventing threat identity.' },
    ],
    aar: {
      sustain: ['You captured the route impact.', 'You avoided turning a civil hazard into a threat report.'],
      improve: ['Follow with a route status update and recommendation.'],
      retrain: ['Review route reporting and civil considerations.'],
      teachingPoint: 'Not every report is enemy-focused. Staffs also need clear civil and terrain updates.',
    },
    tags: ['salute', 'route', 'dsca'],
  },
  {
    id: 'wt-march-001',
    gameId: 'march',
    gameType: 'sequence',
    title: 'MARCH: Rollover Casualty',
    category: 'Medical',
    difficulty: 'Medium',
    timeLimitSeconds: 70,
    scenarioText: 'A Soldier is bleeding heavily from the thigh, breathing fast, and getting cold after a rollover.',
    prompt: 'Tap the MARCH priorities in the correct order.',
    sequenceChoices: ['Airway', 'Circulation', 'Massive hemorrhage', 'Hypothermia/head injury', 'Respiration'],
    correctSequence: ['Massive hemorrhage', 'Airway', 'Respiration', 'Circulation', 'Hypothermia/head injury'],
    aar: {
      sustain: ['You treated the most immediate life threat first.', 'You kept hypothermia prevention in the sequence.'],
      improve: ['Do not jump to circulation before airway and respiration checks.'],
      retrain: ['Review MARCH sequence and trauma priorities.'],
      teachingPoint: 'Massive bleeding can kill quickly. Control it before moving deeper into assessment.',
    },
    tags: ['march', 'medical'],
  },
  {
    id: 'wt-march-002',
    gameId: 'march',
    gameType: 'sequence',
    title: 'MARCH: Blast Overpressure',
    category: 'Medical',
    difficulty: 'Hard',
    timeLimitSeconds: 65,
    scenarioText: 'A Soldier has no obvious major bleeding, is struggling to breathe, and is becoming confused.',
    prompt: 'Use the same MARCH order even if one category has no major finding.',
    sequenceChoices: ['Respiration', 'Airway', 'Massive hemorrhage', 'Hypothermia/head injury', 'Circulation'],
    correctSequence: ['Massive hemorrhage', 'Airway', 'Respiration', 'Circulation', 'Hypothermia/head injury'],
    aar: {
      sustain: ['You preserved the assessment framework.', 'You recognized breathing concerns in the correct place.'],
      improve: ['A category can be checked and cleared; do not skip the framework.'],
      retrain: ['Review assessment order under stress.'],
      teachingPoint: 'MARCH is a disciplined scan. You may clear a category quickly, but the order keeps you from missing killers.',
    },
    tags: ['march', 'medical'],
  },
  {
    id: 'wt-march-003',
    gameId: 'march',
    gameType: 'sequence',
    title: 'MARCH: Cold Weather Injury',
    category: 'Medical',
    difficulty: 'Easy',
    timeLimitSeconds: 75,
    scenarioText: 'A Soldier fell during a winter movement. Bleeding is controlled, airway is open, breathing is normal, but the Soldier is wet and shivering.',
    prompt: 'Sequence the assessment priorities.',
    sequenceChoices: ['Hypothermia/head injury', 'Respiration', 'Massive hemorrhage', 'Circulation', 'Airway'],
    correctSequence: ['Massive hemorrhage', 'Airway', 'Respiration', 'Circulation', 'Hypothermia/head injury'],
    aar: {
      sustain: ['You included hypothermia prevention.', 'You kept the life-threat sequence intact.'],
      improve: ['Cold injury can become serious even after bleeding is controlled.'],
      retrain: ['Review hypothermia prevention in casualty care.'],
      teachingPoint: 'Preventing heat loss is not optional. It protects the casualty while evacuation and treatment continue.',
    },
    tags: ['march', 'cold weather'],
  },
  {
    id: 'wt-convoy-001',
    gameId: 'convoy-drill',
    gameType: 'multipleChoice',
    title: 'Convoy Drill: Disabled Vehicle',
    category: 'Convoy',
    difficulty: 'Medium',
    timeLimitSeconds: 60,
    scenarioText: 'Vehicle 3 reports a power loss and pulls to the shoulder. Convoy is on a public road with limited shoulder space.',
    prompt: 'Select the best immediate convoy leader action.',
    rounds: [
      { id: 'act', label: 'Immediate Action', prompt: 'What should the convoy do first?', options: ['Maintain security, warn traffic, report status, and execute recovery plan', 'All vehicles crowd around the disabled truck', 'Leave the truck and continue without reporting'], correctAnswer: 'Maintain security, warn traffic, report status, and execute recovery plan', explanation: 'Security, traffic safety, reporting, and recovery keep the convoy controlled.' },
      { id: 'report', label: 'Report', prompt: 'What report matters most?', options: ['Location, vehicle status, personnel status, traffic risk, recovery need', 'Only the driver name', 'No report until mission complete'], correctAnswer: 'Location, vehicle status, personnel status, traffic risk, recovery need', explanation: 'Higher needs enough information to support a decision.' },
    ],
    aar: {
      sustain: ['You protected the convoy and the public.', 'You connected the drill to recovery reporting.'],
      improve: ['Avoid bunching vehicles around a disabled truck.'],
      retrain: ['Review convoy breakdown actions.'],
      teachingPoint: 'Breakdowns are not just maintenance events. They create security, traffic, time, and command decisions.',
    },
    tags: ['convoy', 'recovery'],
  },
  {
    id: 'wt-convoy-002',
    gameId: 'convoy-drill',
    gameType: 'multipleChoice',
    title: 'Convoy Drill: Route Blocked',
    category: 'Convoy',
    difficulty: 'Hard',
    timeLimitSeconds: 60,
    scenarioText: 'Lead vehicle reports a flooded low-water crossing. Alternate Route Blue was briefed before SP.',
    prompt: 'Pick the strongest response.',
    rounds: [
      { id: 'act', label: 'Immediate Action', prompt: 'What should the convoy commander do?', options: ['Halt short, establish security, confirm conditions, move to briefed alternate route, report', 'Force the crossing to stay on time', 'Turn around without telling anyone'], correctAnswer: 'Halt short, establish security, confirm conditions, move to briefed alternate route, report', explanation: 'A planned alternate route turns friction into a manageable adjustment.' },
      { id: 'comm', label: 'Commander Update', prompt: 'Best BLUF?', options: ['Route Red blocked by flooding; convoy secure; executing Route Blue; ETA slips 20 minutes', 'We hit a problem but are working it', 'Everything is fine'], correctAnswer: 'Route Red blocked by flooding; convoy secure; executing Route Blue; ETA slips 20 minutes', explanation: 'BLUF, status, action, risk, and timeline are all present.' },
    ],
    aar: {
      sustain: ['You used the alternate route instead of improvising late.', 'You gave a concise commander update.'],
      improve: ['Keep ETA changes tied to supported unit impact.'],
      retrain: ['Review route contingency planning.'],
      teachingPoint: 'A convoy plan is only real when alternates and reports are briefed before movement.',
    },
    tags: ['convoy', 'route'],
  },
  {
    id: 'wt-convoy-003',
    gameId: 'convoy-drill',
    gameType: 'multipleChoice',
    title: 'Convoy Drill: UAS Sighting',
    category: 'Convoy',
    difficulty: 'Medium',
    timeLimitSeconds: 55,
    scenarioText: 'Trail vehicle spots a small UAS following the convoy for approximately one minute.',
    prompt: 'Select disciplined immediate actions.',
    rounds: [
      { id: 'act', label: 'Immediate Action', prompt: 'Best action?', options: ['Report, reduce signature where possible, maintain spacing and movement discipline', 'Stop all vehicles in the open and stare at it', 'Ignore it because it is small'], correctAnswer: 'Report, reduce signature where possible, maintain spacing and movement discipline', explanation: 'Disciplined reporting and movement control matter.' },
      { id: 'report', label: 'Report Quality', prompt: 'Best report phrase?', options: ['One small UAS observed trailing convoy, direction north, confidence medium', 'Definitely a specific enemy system', 'Bird near convoy'], correctAnswer: 'One small UAS observed trailing convoy, direction north, confidence medium', explanation: 'Report what you know and include confidence.' },
    ],
    aar: {
      sustain: ['You reported the UAS without overclaiming.', 'You maintained convoy control.'],
      improve: ['Practice concise UAS SALUTE updates.'],
      retrain: ['Review small UAS reaction basics.'],
      teachingPoint: 'Small UAS events reward discipline: observe, protect, report, and keep the convoy controlled.',
    },
    tags: ['convoy', 'uas'],
  },
  {
    id: 'wt-security-001',
    gameId: 'halt-security',
    gameType: 'multipleChoice',
    title: 'Halt Security: Fuel Stop',
    category: 'Security',
    difficulty: 'Easy',
    timeLimitSeconds: 60,
    scenarioText: 'A convoy halts at a rural fuel point. The site is open on three sides with civilian traffic nearby.',
    prompt: 'Build a basic halt security posture.',
    rounds: [
      { id: 'sector', label: '360 Security', prompt: 'Best placement?', options: ['Assign sectors, maintain dispersion, keep drivers with vehicles, confirm accountability', 'All Soldiers gather by the lead truck', 'Post one person facing the road only'], correctAnswer: 'Assign sectors, maintain dispersion, keep drivers with vehicles, confirm accountability', explanation: '360 security and accountability are the foundation.' },
      { id: 'report', label: 'Report', prompt: 'What update matters?', options: ['Convoy halted, fuel ongoing, security set, all accounted for', 'We stopped', 'No report needed'], correctAnswer: 'Convoy halted, fuel ongoing, security set, all accounted for', explanation: 'Higher needs status, activity, security, and accountability.' },
    ],
    aar: {
      sustain: ['You built 360 security and accountability.', 'You kept the report concise.'],
      improve: ['Account for civilian traffic as a safety factor.'],
      retrain: ['Review halt procedures.'],
      teachingPoint: 'A halt is a tactical and safety event. Set security, keep dispersion, maintain accountability, and report.',
    },
    tags: ['security', 'convoy'],
  },
  {
    id: 'wt-security-002',
    gameId: 'halt-security',
    gameType: 'multipleChoice',
    title: 'Halt Security: Night Checkpoint',
    category: 'Security',
    difficulty: 'Medium',
    timeLimitSeconds: 60,
    scenarioText: 'The convoy stops at a night checkpoint. Visibility is low and one vehicle reports a radio issue.',
    prompt: 'Select the best halt security action.',
    rounds: [
      { id: 'act', label: 'Night Halt', prompt: 'Best action?', options: ['Set sectors, preserve light discipline, verify accountability, troubleshoot comms, report', 'Turn on all headlights and gather everyone', 'Ignore the radio issue until morning'], correctAnswer: 'Set sectors, preserve light discipline, verify accountability, troubleshoot comms, report', explanation: 'Night halts require security, discipline, accountability, and comms control.' },
      { id: 'comms', label: 'Comms', prompt: 'Best PACE move?', options: ['Shift to alternate comms method and report degraded primary', 'Stop communicating', 'Use personal phones only without notifying leadership'], correctAnswer: 'Shift to alternate comms method and report degraded primary', explanation: 'PACE plans exist for degraded communications.' },
    ],
    aar: {
      sustain: ['You protected security and communication discipline.', 'You did not let a radio issue become hidden friction.'],
      improve: ['Brief light discipline before the halt.'],
      retrain: ['Review PACE and night halt procedures.'],
      teachingPoint: 'At night, small lapses become bigger problems. Security, light, accountability, and PACE keep the unit steady.',
    },
    tags: ['security', 'signal'],
  },
  {
    id: 'wt-security-003',
    gameId: 'halt-security',
    gameType: 'multipleChoice',
    title: 'Halt Security: Accountability Gap',
    category: 'Security',
    difficulty: 'Hard',
    timeLimitSeconds: 60,
    scenarioText: 'During a short halt, a squad leader reports one Soldier is not immediately visible after moving to check cargo straps.',
    prompt: 'Choose the leader response.',
    rounds: [
      { id: 'act', label: 'Accountability', prompt: 'Best response?', options: ['Freeze unnecessary movement, confirm last known location, search safely, report accountability issue', 'Continue movement and hope they appear', 'Send everyone wandering alone'], correctAnswer: 'Freeze unnecessary movement, confirm last known location, search safely, report accountability issue', explanation: 'Accountability gaps require controlled action and reporting.' },
      { id: 'prevent', label: 'Prevention', prompt: 'Best prevention habit?', options: ['Buddy teams and positive headcount before SP', 'Trust everyone to remember', 'Only count vehicles'], correctAnswer: 'Buddy teams and positive headcount before SP', explanation: 'People are the priority, not just vehicles.' },
    ],
    aar: {
      sustain: ['You treated accountability as urgent.', 'You used controlled search and reporting.'],
      improve: ['Build positive headcount into every halt and SP.'],
      retrain: ['Review accountability procedures.'],
      teachingPoint: 'If you do not know where your people are, the mission is already at risk.',
    },
    tags: ['security', 'accountability'],
  },
];

export interface OpforAsset {
  id: string;
  name: string;
  country: string;
  faction: 'Russian' | 'Chinese' | 'UAS' | 'Unknown';
  category: string;
  role: string;
  difficulty: DifficultyLabel;
  image?: string;
  imageCredit?: string;
  recognitionFeatures: string[];
  similarAssets: string[];
  reportingTip: string;
}

export const opforAssets: OpforAsset[] = [
  { id: 'ru-t72', name: 'T-72 Series', country: 'Russia / widely exported', faction: 'Russian', category: 'Main Battle Tank', role: 'Armored maneuver', difficulty: 'Easy', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/T-72%20Main%20Battle%20Tank.jpg', imageCredit: 'Wikimedia Commons file page', recognitionFeatures: ['Tracked armored vehicle', 'Large main gun', 'Low profile', 'Rounded turret shape'], similarAssets: ['T-80', 'T-90', 'ZTZ-96'], reportingTip: 'If unsure, report possible tank or tracked armored vehicle rather than a specific model.' },
  { id: 'ru-t80', name: 'T-80 Series', country: 'Russia / widely exported', faction: 'Russian', category: 'Main Battle Tank', role: 'Armored maneuver', difficulty: 'Medium', recognitionFeatures: ['Tracked chassis', 'Large main gun', 'Low tank silhouette', 'Compact turret'], similarAssets: ['T-72', 'T-90'], reportingTip: 'Category is often more useful than guessing the exact tank series.' },
  { id: 'ru-t90', name: 'T-90 Series', country: 'Russia', faction: 'Russian', category: 'Main Battle Tank', role: 'Armored maneuver', difficulty: 'Hard', recognitionFeatures: ['Tracked tank', 'Large main gun', 'Modernized turret profile', 'Low silhouette'], similarAssets: ['T-72', 'T-80'], reportingTip: 'Use possible/likely language unless the view is clear.' },
  { id: 'ru-bmp', name: 'BMP Series', country: 'Russia / widely exported', faction: 'Russian', category: 'Infantry Fighting Vehicle', role: 'Mechanized infantry transport and fire support', difficulty: 'Easy', recognitionFeatures: ['Tracked vehicle', 'Smaller cannon than tank', 'Troop carrier profile', 'Low hull'], similarAssets: ['BTR', 'ZBD'], reportingTip: 'Report as tracked IFV if exact BMP variant is unclear.' },
  { id: 'ru-btr', name: 'BTR Series', country: 'Russia / widely exported', faction: 'Russian', category: 'Armored Personnel Carrier', role: 'Wheeled troop transport', difficulty: 'Easy', recognitionFeatures: ['Wheeled armored vehicle', 'Long hull', 'Troop carrier role', 'Turret or weapon station may be small'], similarAssets: ['ZBL', 'BMP'], reportingTip: 'Wheeled APC is a useful report even without model certainty.' },
  { id: 'ru-mtlb', name: 'MT-LB', country: 'Russia / widely exported', faction: 'Russian', category: 'Tracked Utility Vehicle', role: 'Utility transport and support', difficulty: 'Medium', recognitionFeatures: ['Tracked utility hull', 'Low boxy profile', 'Small weapon station possible', 'Support vehicle appearance'], similarAssets: ['BMP', 'tracked carrier'], reportingTip: 'Report tracked utility/support vehicle when unsure.' },
  { id: 'ru-2s', name: '2S Self-Propelled Artillery Family', country: 'Russia', faction: 'Russian', category: 'Self-Propelled Artillery', role: 'Indirect fire support', difficulty: 'Medium', recognitionFeatures: ['Tracked or armored chassis', 'Large artillery tube', 'Turreted or casemate gun system', 'Support echelon role'], similarAssets: ['PCL', 'PHZ'], reportingTip: 'Report artillery category and direction of travel first.' },
  { id: 'ru-grad', name: 'BM-21 Grad', country: 'Russia / widely exported', faction: 'Russian', category: 'Rocket Artillery', role: 'Area rocket fires', difficulty: 'Medium', recognitionFeatures: ['Truck-mounted rocket launcher', 'Rectangular launcher pack', 'Multiple tubes', 'Tactical truck chassis'], similarAssets: ['PHZ', 'rocket artillery truck'], reportingTip: 'Report possible rocket artillery if a launcher pack is visible.' },
  { id: 'ru-pantsir', name: 'Pantsir Air Defense', country: 'Russia', faction: 'Russian', category: 'Air Defense', role: 'Short range air defense', difficulty: 'Hard', recognitionFeatures: ['Truck or tracked air defense system', 'Missile canisters', 'Radar/optical equipment', 'Gun/missile combination possible'], similarAssets: ['Tor', 'HQ family'], reportingTip: 'Report air defense system if you see launchers or radar gear.' },
  { id: 'ru-tor', name: 'Tor Air Defense', country: 'Russia', faction: 'Russian', category: 'Air Defense', role: 'Short range air defense', difficulty: 'Hard', recognitionFeatures: ['Tracked air defense vehicle', 'Boxy turret/module', 'Radar panels', 'Missile system role'], similarAssets: ['Pantsir', 'HQ family'], reportingTip: 'Avoid exact model claims from poor angles.' },
  { id: 'ru-s300', name: 'S-300/S-400 Family', country: 'Russia', faction: 'Russian', category: 'Air Defense', role: 'Long range air defense', difficulty: 'Expert', recognitionFeatures: ['Large missile canisters', 'Transporter erector launcher', 'Associated radar vehicles', 'Large support footprint'], similarAssets: ['HQ family'], reportingTip: 'Report launcher/radar/support vehicles separately when possible.' },
  { id: 'ru-truck', name: 'Ural/Kamaz Tactical Trucks', country: 'Russia', faction: 'Russian', category: 'Tactical Truck', role: 'Logistics and transport', difficulty: 'Easy', recognitionFeatures: ['Military cargo truck', 'Canvas or cargo bed', 'Wheeled logistics vehicle', 'May tow equipment'], similarAssets: ['Dongfeng tactical vehicles'], reportingTip: 'Logistics vehicles can be operationally important; report activity and cargo if observed.' },
  { id: 'cn-ztz99', name: 'ZTZ-99 / Type 99', country: 'China', faction: 'Chinese', category: 'Main Battle Tank', role: 'Armored maneuver', difficulty: 'Hard', recognitionFeatures: ['Tracked tank', 'Large main gun', 'Angular turret profile', 'Modern MBT silhouette'], similarAssets: ['ZTZ-96', 'T-90'], reportingTip: 'Report likely Chinese tank only with clear context or markings.' },
  { id: 'cn-ztz96', name: 'ZTZ-96 / Type 96', country: 'China', faction: 'Chinese', category: 'Main Battle Tank', role: 'Armored maneuver', difficulty: 'Medium', recognitionFeatures: ['Tracked tank', 'Large main gun', 'Lower profile', 'Armored turret'], similarAssets: ['ZTZ-99', 'T-72'], reportingTip: 'If unsure, tank category beats exact type guessing.' },
  { id: 'cn-zbd', name: 'ZBD IFV Family', country: 'China', faction: 'Chinese', category: 'Infantry Fighting Vehicle', role: 'Mechanized infantry transport', difficulty: 'Medium', recognitionFeatures: ['Tracked IFV', 'Medium cannon', 'Troop carrier profile', 'Lower weight than MBT'], similarAssets: ['BMP', 'ZBL'], reportingTip: 'Use tracked IFV if the exact family is unclear.' },
  { id: 'cn-zbl', name: 'ZBL Wheeled Armored Vehicle Family', country: 'China', faction: 'Chinese', category: 'Armored Personnel Carrier', role: 'Wheeled maneuver and troop transport', difficulty: 'Medium', recognitionFeatures: ['8x8 wheeled armored vehicle', 'Long hull', 'Turret or weapon station', 'Troop carrier profile'], similarAssets: ['BTR', 'ZBD'], reportingTip: 'Wheeled armored vehicle is a strong category report.' },
  { id: 'cn-pcl', name: 'PCL Self-Propelled Artillery Family', country: 'China', faction: 'Chinese', category: 'Self-Propelled Artillery', role: 'Mobile artillery support', difficulty: 'Medium', recognitionFeatures: ['Truck-mounted gun', 'Large artillery tube', 'Outrigger/stabilizer features possible', 'Logistics-heavy role'], similarAssets: ['2S family'], reportingTip: 'Report artillery role and movement direction.' },
  { id: 'cn-phz', name: 'PHZ Rocket Artillery Family', country: 'China', faction: 'Chinese', category: 'Rocket Artillery', role: 'Rocket fires', difficulty: 'Medium', recognitionFeatures: ['Multiple rocket launcher', 'Tracked or wheeled launcher', 'Large launcher pod', 'Support vehicles nearby'], similarAssets: ['BM-21 Grad'], reportingTip: 'Rocket artillery category is the key recognition feature.' },
  { id: 'cn-hq', name: 'HQ Air Defense Family', country: 'China', faction: 'Chinese', category: 'Air Defense', role: 'Air defense', difficulty: 'Hard', recognitionFeatures: ['Missile launch canisters', 'Radar/support vehicles', 'Launcher vehicle', 'Air defense site pattern'], similarAssets: ['S-300/S-400', 'Tor'], reportingTip: 'Report air defense equipment without overstating exact model.' },
  { id: 'cn-dftruck', name: 'Dongfeng Tactical Vehicle Family', country: 'China', faction: 'Chinese', category: 'Tactical Truck', role: 'Logistics and transport', difficulty: 'Easy', recognitionFeatures: ['Military wheeled truck', 'Cargo or utility body', 'May carry supplies or troops', 'Convoy support role'], similarAssets: ['Ural/Kamaz'], reportingTip: 'Track vehicle count, cargo, activity, and route.' },
  { id: 'ru-su25', name: 'Su-25', country: 'Russia', faction: 'Russian', category: 'Attack Aircraft', role: 'Close air support', difficulty: 'Medium', recognitionFeatures: ['Straight wing attack aircraft', 'Twin engines', 'Robust low-altitude profile', 'Single-seat attack role'], similarAssets: ['trainer/attack aircraft'], reportingTip: 'Report aircraft category and direction; do not assume mission.' },
  { id: 'ru-su27', name: 'Su-27/30/35 Family', country: 'Russia', faction: 'Russian', category: 'Fighter Aircraft', role: 'Air superiority/multirole', difficulty: 'Medium', recognitionFeatures: ['Twin-engine fighter', 'Large planform', 'Twin tails', 'Pointed nose'], similarAssets: ['J-11/J-16', 'MiG-29'], reportingTip: 'Family-level reporting is appropriate when exact variant is unclear.' },
  { id: 'ru-mig29', name: 'MiG-29', country: 'Russia / widely exported', faction: 'Russian', category: 'Fighter Aircraft', role: 'Fighter/multirole', difficulty: 'Medium', recognitionFeatures: ['Twin-engine fighter', 'Twin tails', 'Compact fighter shape', 'Wing-root intake area'], similarAssets: ['Su-27 family', 'J-10'], reportingTip: 'Report fighter aircraft with confidence level.' },
  { id: 'ru-su34', name: 'Su-34', country: 'Russia', faction: 'Russian', category: 'Strike Aircraft', role: 'Strike/interdiction', difficulty: 'Hard', recognitionFeatures: ['Large twin-engine aircraft', 'Side-by-side cockpit impression', 'Twin tails', 'Strike role profile'], similarAssets: ['Su-27 family'], reportingTip: 'Use strike aircraft if exact identification is uncertain.' },
  { id: 'ru-mi8', name: 'Mi-8/17', country: 'Russia / widely exported', faction: 'Russian', category: 'Transport Helicopter', role: 'Lift and transport', difficulty: 'Easy', recognitionFeatures: ['Medium transport helicopter', 'Single main rotor', 'Tail rotor', 'Cargo/passenger cabin'], similarAssets: ['Z-20'], reportingTip: 'Report helicopter count, activity, direction, and landing if observed.' },
  { id: 'ru-mi24', name: 'Mi-24/35', country: 'Russia / widely exported', faction: 'Russian', category: 'Attack Helicopter', role: 'Attack and troop transport', difficulty: 'Medium', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mil%20Mi-24%20Hind%20Helicopter%20%2851326367686%29.jpg', imageCredit: 'Wikimedia Commons file page', recognitionFeatures: ['Attack helicopter profile', 'Large fuselage', 'Stub wings', 'Tandem/stepped cockpit impression'], similarAssets: ['Ka-52', 'Z-10'], reportingTip: 'Report attack helicopter if weapons/stub wings are visible.' },
  { id: 'ru-ka52', name: 'Ka-52', country: 'Russia', faction: 'Russian', category: 'Attack Helicopter', role: 'Attack/reconnaissance', difficulty: 'Hard', recognitionFeatures: ['Attack helicopter', 'Coaxial rotor impression', 'Shorter fuselage', 'Stub wings'], similarAssets: ['Mi-24/35', 'Z-10'], reportingTip: 'Rotor layout can help, but only if clearly observed.' },
  { id: 'cn-j10', name: 'J-10', country: 'China', faction: 'Chinese', category: 'Fighter Aircraft', role: 'Multirole fighter', difficulty: 'Medium', recognitionFeatures: ['Single-engine fighter', 'Canard/delta impression', 'Single tail', 'Compact fighter shape'], similarAssets: ['MiG-29'], reportingTip: 'Use possible single-engine fighter if view is limited.' },
  { id: 'cn-j11', name: 'J-11/J-16 Family', country: 'China', faction: 'Chinese', category: 'Fighter Aircraft', role: 'Air superiority/multirole', difficulty: 'Medium', recognitionFeatures: ['Twin-engine fighter', 'Twin tails', 'Large fighter shape', 'Similar to Flanker family'], similarAssets: ['Su-27/30/35'], reportingTip: 'Family-level recognition is acceptable in training.' },
  { id: 'cn-j20', name: 'J-20', country: 'China', faction: 'Chinese', category: 'Fighter Aircraft', role: 'Stealth fighter', difficulty: 'Hard', recognitionFeatures: ['Large fighter', 'Angular low-observable shaping', 'Canards', 'Twin-engine impression'], similarAssets: ['advanced fighter'], reportingTip: 'Report advanced fighter category when exact view is poor.' },
  { id: 'cn-h6', name: 'H-6', country: 'China', faction: 'Chinese', category: 'Bomber Aircraft', role: 'Bomber/missile carrier', difficulty: 'Medium', recognitionFeatures: ['Large bomber aircraft', 'Long fuselage', 'Swept wings', 'Twin engine pods'], similarAssets: ['large transport/bomber'], reportingTip: 'Report large aircraft category and direction.' },
  { id: 'cn-y20', name: 'Y-20', country: 'China', faction: 'Chinese', category: 'Transport Aircraft', role: 'Strategic airlift', difficulty: 'Medium', recognitionFeatures: ['Large transport aircraft', 'High wing impression', 'Four engines', 'Heavy lift role'], similarAssets: ['large cargo aircraft'], reportingTip: 'Transport role matters for sustainment assessment.' },
  { id: 'cn-z10', name: 'Z-10', country: 'China', faction: 'Chinese', category: 'Attack Helicopter', role: 'Attack helicopter', difficulty: 'Medium', recognitionFeatures: ['Slender attack helicopter', 'Tandem cockpit', 'Stub wings', 'Narrow fuselage'], similarAssets: ['Ka-52', 'Mi-24/35'], reportingTip: 'Report attack helicopter rather than guessing exact type from distance.' },
  { id: 'cn-z20', name: 'Z-20', country: 'China', faction: 'Chinese', category: 'Transport Helicopter', role: 'Utility lift', difficulty: 'Medium', recognitionFeatures: ['Medium utility helicopter', 'Transport cabin', 'Single main rotor', 'Tail rotor'], similarAssets: ['Mi-8/17'], reportingTip: 'Report lift/transport activity and landing zones if observed.' },
  { id: 'uas-quad', name: 'Small Quadcopter', country: 'Various', faction: 'UAS', category: 'Small UAS', role: 'Short range observation', difficulty: 'Easy', recognitionFeatures: ['Small multi-rotor aircraft', 'Hovering flight', 'Low altitude', 'Short duration observation'], similarAssets: ['commercial quadcopter'], reportingTip: 'Report size, location, activity, direction, and confidence.' },
  { id: 'uas-fixed', name: 'Fixed-Wing Reconnaissance UAS', country: 'Various', faction: 'UAS', category: 'Fixed-Wing UAS', role: 'Reconnaissance', difficulty: 'Medium', recognitionFeatures: ['Small fixed wing', 'Loitering or straight flight', 'No pilot visible', 'Light airframe'], similarAssets: ['small aircraft'], reportingTip: 'If unsure, report possible fixed-wing UAS.' },
  { id: 'uas-loiter', name: 'Loitering Munition', country: 'Various', faction: 'UAS', category: 'Loitering Munition', role: 'One-way attack/reconnaissance', difficulty: 'Hard', recognitionFeatures: ['Small UAS-like aircraft', 'Loitering behavior', 'May dive or descend rapidly', 'Difficult to classify'], similarAssets: ['fixed-wing UAS'], reportingTip: 'Do not guess intent; report observed behavior.' },
  { id: 'uas-male', name: 'Larger MALE-Style Drone', country: 'Various', faction: 'UAS', category: 'Large UAS', role: 'Longer endurance reconnaissance/strike capable platform', difficulty: 'Hard', recognitionFeatures: ['Larger fixed-wing UAS', 'Long wingspan', 'Pusher prop or jet profile possible', 'Persistent flight'], similarAssets: ['light aircraft'], reportingTip: 'Report large UAS category, direction, altitude estimate, and confidence.' },
];

export const opforQuizQuestions = opforAssets.slice(0, 24).map(asset => ({
  id: `${asset.id}-category`,
  assetId: asset.id,
  question: `What category best fits ${asset.name}?`,
  options: [asset.category, 'Tactical Truck', 'Air Defense', 'Unknown / Not enough information'].filter((value, index, arr) => arr.indexOf(value) === index),
  correctAnswer: asset.category,
  explanation: asset.reportingTip,
}));

export const silhouettePrompts = ['ru-t72', 'ru-btr', 'ru-grad', 'cn-zbl', 'uas-quad'].map((assetId, index) => ({
  id: `sil-${index + 1}`,
  assetId,
  includeUnknown: index === 4,
}));

export const threatReportPrompts = [
  { id: 'tr-1', assetId: 'ru-btr', scenario: 'A wheeled armored vehicle moves east past Checkpoint 2 at 1010.', bestReport: 'Possible wheeled APC moving east past Checkpoint 2 at 1010, confidence medium.' },
  { id: 'tr-2', assetId: 'uas-quad', scenario: 'A small quadcopter hovers above the motor pool for 90 seconds and departs north.', bestReport: 'One small UAS observed over motor pool, departed north, confidence high on category.' },
  { id: 'tr-3', assetId: 'ru-grad', scenario: 'A truck with a rectangular launcher pack is seen moving with support vehicles.', bestReport: 'Possible rocket artillery truck with support vehicles, direction and time reported, confidence medium.' },
  { id: 'tr-4', assetId: 'cn-y20', scenario: 'A large four-engine aircraft is observed overhead moving west.', bestReport: 'Large transport aircraft moving west, exact model unknown, confidence medium.' },
  { id: 'tr-5', assetId: 'ru-pantsir', scenario: 'A truck-mounted system with radar-like equipment is parked near a convoy.', bestReport: 'Possible air defense vehicle near convoy, radar/launcher features observed, confidence low to medium.' },
];

export const matchingPrompts = [
  { id: 'match-1', prompt: 'Tracked tank with large main gun', answer: 'Main Battle Tank' },
  { id: 'match-2', prompt: 'Wheeled troop carrier profile', answer: 'Armored Personnel Carrier' },
  { id: 'match-3', prompt: 'Truck with multiple rocket tubes', answer: 'Rocket Artillery' },
  { id: 'match-4', prompt: 'Small hovering multi-rotor aircraft', answer: 'Small UAS' },
  { id: 'match-5', prompt: 'Medium helicopter used for lift', answer: 'Transport Helicopter' },
];

export interface DscaMission {
  id: string;
  title: string;
  difficulty: DifficultyLabel;
  estimatedTime: string;
  trainingFocus: string[];
  situation: string;
  mission: string;
  commanderIntent: string;
  assets: string[];
  decisions: { id: string; prompt: string; options: ChoiceOption[] }[];
  frictionEvents: { id: string; title: string; text: string; options: ChoiceOption[] }[];
  commanderUpdate: { prompt: string; options: ChoiceOption[] };
  aarTeachingPoint: string;
}

function dscaMission(id: string, title: string, difficulty: DifficultyLabel, situation: string, focus: string[]): DscaMission {
  return {
    id,
    title,
    difficulty,
    estimatedTime: '6-10 minutes',
    trainingFocus: focus,
    situation,
    mission: 'Support civil authorities with disciplined logistics, communication, safety, and leader judgment.',
    commanderIntent: 'Protect life, preserve critical infrastructure, maintain accountability, and support civilian lead agencies without overstepping.',
    assets: ['40 Soldiers', '6 LMTV trucks', '2 water trailers', '1 fuel support package', '1 comms team', '1 maintenance/recovery team', '2 liaison officers'],
    decisions: [
      {
        id: 'stage',
        prompt: 'Where do you stage the main support element?',
        options: [
          { text: 'Safe staging area near the affected route with comms and room to expand', effects: { mission: 10, communication: 8, safety: 6, speed: 6 }, feedback: 'Good balance of speed, safety, access, and coordination.' },
          { text: 'At the armory far from the incident', effects: { mission: -6, safety: 4, speed: -12 }, feedback: 'Safe, but too slow for an urgent support mission.' },
          { text: 'Inside the most hazardous area', effects: { mission: -5, safety: -16, risk: -12 }, feedback: 'Fast access does not justify unnecessary Soldier risk.' },
        ],
      },
      {
        id: 'reserve',
        prompt: 'What do you hold in reserve?',
        options: [
          { text: 'One truck team, recovery support, and a liaison ready for emerging requests', effects: { sustainment: 8, mission: 5, trust: 6 }, feedback: 'A reserve gives the commander options when the situation changes.' },
          { text: 'Nothing; commit every asset immediately', effects: { mission: 3, sustainment: -10, trust: -5 }, feedback: 'Initial speed improves, but you lose flexibility.' },
          { text: 'Most assets, waiting for perfect information', effects: { speed: -12, mission: -8, safety: 2 }, feedback: 'Overholding assets slows support.' },
        ],
      },
    ],
    frictionEvents: [
      {
        id: 'comms',
        title: 'Communications Degraded',
        text: 'Cell coverage drops and one partner cannot reach your staging area.',
        options: [
          { text: 'Shift to PACE, push liaison update, and confirm reporting windows', effects: { communication: 12, trust: 8, mission: 4 }, feedback: 'Good. You protected information flow.' },
          { text: 'Wait for service to return', effects: { communication: -12, speed: -8, trust: -6 }, feedback: 'Waiting silently creates uncertainty.' },
        ],
      },
      {
        id: 'request',
        title: 'Competing Requests',
        text: 'Two civilian partners request the same trucks at the same time.',
        options: [
          { text: 'Clarify priorities through the civil lead, brief risk, and recommend allocation', effects: { communication: 10, trust: 10, mission: 6 }, feedback: 'Good civil-support tone and commander trust.' },
          { text: 'Pick one request without coordination', effects: { mission: -3, communication: -10, trust: -10 }, feedback: 'Uncoordinated support creates friction.' },
        ],
      },
    ],
    commanderUpdate: {
      prompt: 'The commander asks for the current status. Pick the best update.',
      options: [
        { text: 'BLUF: support is moving, main risk is comms and route access. Recommend keeping one truck team in reserve and using liaison updates every 30 minutes.', effects: { communication: 12, trust: 14 }, feedback: 'Clear BLUF, risk, and recommendation.' },
        { text: 'We are doing a lot of things and people keep calling.', effects: { communication: -12, trust: -10 }, feedback: 'Too vague for command decision-making.' },
        { text: 'Everything is perfect.', effects: { trust: -12, risk: -8 }, feedback: 'Unsupported confidence reduces trust.' },
      ],
    },
    aarTeachingPoint: 'In DSCA, speed matters, but disciplined coordination with civilian partners and Soldier safety are what keep support credible.',
  };
}

export const dscaMissions: DscaMission[] = [
  dscaMission('dsca-wildfire-001', 'Wildfire Response', 'Medium', 'A fast-moving wildfire threatens a rural community. The Guard is asked to support evacuation routes, water distribution, traffic control support, and logistics staging.', ['Resource allocation', 'Civil support coordination', 'Risk management']),
  dscaMission('dsca-flood-001', 'Flood Response', 'Medium', 'Heavy rain causes river flooding. Local authorities request high-water vehicle support, sandbag movement, evacuation assistance, and shelter logistics.', ['Route prioritization', 'Shelter logistics', 'Accountability']),
  dscaMission('dsca-sar-001', 'Search and Rescue Support', 'Easy', 'A missing person search expands into rough terrain. The Guard supports the civilian SAR lead agency with personnel, comms, transport, and logistics.', ['Civil lead support', 'Personnel accountability', 'Communications']),
  dscaMission('dsca-blizzard-001', 'Blizzard Support', 'Medium', 'A winter storm strands civilians and blocks key routes. The Guard supports warming shelters, transport, water, generators, and road clearance coordination.', ['Cold weather risk', 'Shelter sustainment', 'Convoy safety']),
  dscaMission('dsca-civil-001', 'Civil Disturbance Support', 'Hard', 'The Guard supports civil authorities with logistics, transport, communications, and presence operations in a neutral public safety support role.', ['Restraint', 'Communication', 'Civil authority coordination']),
  dscaMission('dsca-earthquake-001', 'Earthquake Response', 'Hard', 'A significant earthquake damages roads, communications, and utilities. Multiple agencies request route assessment, water, and staging support.', ['Multi-agency coordination', 'Route assessment', 'Sustainment']),
  dscaMission('dsca-water-001', 'Water Distribution', 'Easy', 'A town water system is disrupted. The Guard plans water points, convoy resupply, public messaging support, and status reporting.', ['Commodity flow', 'Distribution points', 'Public support']),
  dscaMission('dsca-shelter-001', 'Shelter Support', 'Easy', 'Displaced civilians require shelter support with cots, water, food, generators, medical coordination, and transportation.', ['Class I/water', 'Shelter logistics', 'Medical coordination']),
  dscaMission('dsca-road-001', 'Road Clearance', 'Medium', 'Storm damage blocks critical routes. Engineer equipment, fuel, route status, and convoy movement must be synchronized safely.', ['Engineer support', 'Fuel planning', 'Route reporting']),
];

export interface ConvoyScenario {
  id: string;
  title: string;
  difficulty: DifficultyLabel;
  mission: string;
  startPoint: string;
  destination: string;
  requiredArrivalTime: string;
  cargo: string[];
  routes: { id: string; name: string; distanceKm: number; risk: string; travelTimeMinutes: number; notes: string; best?: boolean }[];
  planSteps: { id: string; prompt: string; options: ChoiceOption[] }[];
  friction: { id: string; title: string; text: string; options: ChoiceOption[] }[];
  teachingPoint: string;
}

function convoyScenario(id: string, title: string, difficulty: DifficultyLabel, mission: string, cargo: string[]): ConvoyScenario {
  return {
    id,
    title,
    difficulty,
    mission,
    startPoint: 'Sustainment Node',
    destination: 'Supported Unit Logistics Release Point',
    requiredArrivalTime: '1600',
    cargo,
    routes: [
      { id: 'red', name: 'Route Red', distanceKm: 42, risk: 'Medium', travelTimeMinutes: 75, notes: 'Fastest route but congested.', best: false },
      { id: 'blue', name: 'Route Blue', distanceKm: 55, risk: 'Low', travelTimeMinutes: 105, notes: 'Longer but more reliable.', best: true },
      { id: 'black', name: 'Route Black', distanceKm: 38, risk: 'High', travelTimeMinutes: 70, notes: 'Short, narrow, and poor recovery access.', best: false },
    ],
    planSteps: [
      { id: 'recovery', prompt: 'Recovery plan', options: [
        { text: 'Wrecker/trail vehicle briefed with actions on breakdown', points: 15, feedback: 'Recovery is planned before SP.' },
        { text: 'Call maintenance only if something breaks', points: 4, feedback: 'Reactive recovery increases delay.' },
        { text: 'No recovery plan', points: 0, feedback: 'A breakdown will hurt.' },
      ] },
      { id: 'comms', prompt: 'Communications plan', options: [
        { text: 'PACE plan with check-in windows and lost comms action', points: 15, feedback: 'Good comms plan.' },
        { text: 'Primary radio only', points: 6, feedback: 'Primary-only plans are brittle.' },
        { text: 'Use whatever works', points: 0, feedback: 'Unclear comms create confusion.' },
      ] },
      { id: 'medical', prompt: 'Medical / CCP plan', options: [
        { text: 'CCP, aid bag, casualty report flow, and evacuation trigger briefed', points: 15, feedback: 'Medical actions are clear.' },
        { text: 'Aid bag in lead truck only', points: 6, feedback: 'Some preparation, but incomplete.' },
        { text: 'No casualty plan', points: 0, feedback: 'Casualty friction will be severe.' },
      ] },
      { id: 'fuel', prompt: 'Refuel plan', options: [
        { text: 'Fuel checked, reserve planned, refuel trigger briefed', points: 15, feedback: 'Fuel risk reduced.' },
        { text: 'Assume full tanks are enough', points: 6, feedback: 'Assumptions are not a plan.' },
        { text: 'No fuel check', points: 0, feedback: 'Fuel shortfall risk is high.' },
      ] },
      { id: 'security', prompt: 'Security and contingencies', options: [
        { text: 'Spacing, halt security, route block, UAS, breakdown, rollover actions briefed', points: 20, feedback: 'The convoy has shared expectations.' },
        { text: 'Only actions on contact briefed', points: 8, feedback: 'Partial plan.' },
        { text: 'No contingency brief', points: 0, feedback: 'The convoy will improvise under stress.' },
      ] },
    ],
    friction: [
      { id: 'breakdown', title: 'Vehicle Breakdown', text: 'Vehicle 2 loses power between checkpoints.', options: [
        { text: 'Execute recovery plan, establish security, report status and ETA impact', points: 18, feedback: 'Good use of the plan.' },
        { text: 'Send one Soldier back alone', points: 2, feedback: 'Poor security and accountability.' },
      ] },
      { id: 'route-block', title: 'Route Blocked', text: 'Civilian traffic and debris block the primary route.', options: [
        { text: 'Halt short, verify, shift to alternate route, report new ETA', points: 18, feedback: 'Strong route control.' },
        { text: 'Push through without coordination', points: 2, feedback: 'Risky and poorly coordinated.' },
      ] },
    ],
    teachingPoint: 'A good convoy plan accounts for route, time, fuel, comms, recovery, casualties, and contingencies before movement begins.',
  };
}

export const convoyScenarios: ConvoyScenario[] = [
  convoyScenario('convoy-class-i-001', 'Class I Resupply Convoy', 'Easy', 'Move food and water to a supported unit before 1600.', ['800 gallons water', '400 meals']),
  convoyScenario('convoy-class-iii-001', 'Class III Fuel Push', 'Medium', 'Move fuel to a forward logistics element while protecting fuel reserve and recovery.', ['Bulk fuel support package']),
  convoyScenario('convoy-ammo-001', 'Ammo Resupply', 'Hard', 'Move ammunition while balancing timing, safety, and route risk.', ['Class V ammunition pallets']),
  convoyScenario('convoy-recovery-001', 'Disabled Vehicle Recovery', 'Medium', 'Recover an NMC vehicle from a remote location.', ['Recovery team', 'Repair parts']),
  convoyScenario('convoy-dsca-water-001', 'DSCA Water Distribution Convoy', 'Easy', 'Move water to a civilian distribution point during a domestic emergency.', ['Water trailers', 'Bottled water pallets']),
];

export interface NewSoldierLesson {
  id: string;
  title: string;
  estimatedTime: string;
  summary: string;
  contentBlocks: { heading: string; body: string }[];
  checks: { prompt: string; options: string[]; answer: string; explanation: string }[];
  completionBadge?: string;
}

export const newSoldierLessons: NewSoldierLesson[] = [
  {
    id: 'new-welcome',
    title: 'Welcome to the Unit',
    estimatedTime: '4 minutes',
    summary: 'What a CSSB does, why sustainment matters, and where you fit.',
    contentBlocks: [
      { heading: 'What CSSB Means', body: 'A Combat Sustainment Support Battalion helps units keep moving, supplied, maintained, and supported.' },
      { heading: 'Why Logistics Matters', body: 'Operations fail when food, water, fuel, ammo, maintenance, and movement are not synchronized.' },
    ],
    checks: [
      { prompt: 'What is the simplest CSSB purpose?', options: ['Keep units supplied and supported', 'Replace every staff section', 'Only conduct ceremonies'], answer: 'Keep units supplied and supported', explanation: 'Sustainment keeps the force able to operate.' },
    ],
    completionBadge: 'Welcome Aboard',
  },
  {
    id: 'new-structure',
    title: 'Unit Structure',
    estimatedTime: '5 minutes',
    summary: 'Battalion, companies, staff, platoons, sections, and supported units.',
    contentBlocks: [
      { heading: 'Battalion Team', body: 'The battalion includes a command team, staff, companies, platoons, and sections that support the mission together.' },
      { heading: 'Editable Framework', body: 'This lesson stays generic so the real 495 CSSB structure can be customized later.' },
    ],
    checks: [
      { prompt: 'Who helps the commander understand and synchronize the fight?', options: ['The staff', 'Only one Soldier', 'No one'], answer: 'The staff', explanation: 'The staff turns information into usable recommendations.' },
    ],
  },
  {
    id: 'new-chain',
    title: 'Chain of Command',
    estimatedTime: '4 minutes',
    summary: 'Who to go to first, when to elevate, and why clarity matters.',
    contentBlocks: [
      { heading: 'Start Close', body: 'Most issues should start with your team leader or squad leader so the chain can solve problems at the right level.' },
      { heading: 'Urgent Issues', body: 'Safety, medical, harassment, and urgent risk issues should be elevated immediately through the right channel.' },
    ],
    checks: [
      { prompt: 'You are missing required equipment before movement. What should you do?', options: ['Tell your first-line leader early', 'Hide it until SP', 'Borrow gear without telling anyone'], answer: 'Tell your first-line leader early', explanation: 'Early communication gives leaders time to fix the problem.' },
    ],
  },
  {
    id: 'new-staff',
    title: 'Staff Sections and What They Do',
    estimatedTime: '6 minutes',
    summary: 'S1, S2, S3, S4, S6, SPO, commander, XO, and CSM roles.',
    contentBlocks: [
      { heading: 'S1/S2/S3', body: 'S1 tracks people, S2 tracks threat/security context, and S3 synchronizes operations and training.' },
      { heading: 'S4/S6/SPO', body: 'S4 tracks logistics, supply, and maintenance. S6 enables communications. SPO plans sustainment support.' },
    ],
    checks: [
      { prompt: 'Radio fill issue', options: ['S6', 'S1', 'S2'], answer: 'S6', explanation: 'Signal issues normally start with S6.' },
      { prompt: 'Personnel accountability', options: ['S1', 'S4', 'S6'], answer: 'S1', explanation: 'S1 owns personnel status and strength reporting.' },
      { prompt: 'Training calendar', options: ['S3', 'S2', 'S1'], answer: 'S3', explanation: 'S3 manages operations and training synchronization.' },
    ],
    completionBadge: 'Staff Smart',
  },
  {
    id: 'new-reports',
    title: 'Basic Reports',
    estimatedTime: '6 minutes',
    summary: 'SALUTE, ACE, SITREP, LOGSTAT, 9-line MEDEVAC, SPOTREP, maintenance, and PERSTAT.',
    contentBlocks: [
      { heading: 'Report Selection', body: 'The right report gets the right information to the right people without extra noise.' },
      { heading: 'Common Reports', body: 'SALUTE reports observations. ACE reports Ammo, Casualties, Equipment. LOGSTAT reports logistics status. 9-line MEDEVAC requests evacuation.' },
    ],
    checks: [
      { prompt: 'You observe a suspicious vehicle near the route. Which report fits best?', options: ['SALUTE', 'LOGSTAT', 'Award recommendation'], answer: 'SALUTE', explanation: 'SALUTE organizes observed activity.' },
      { prompt: 'Your section reports ammo, casualty, and equipment status. Which report?', options: ['ACE', 'CUB', 'MOPP'], answer: 'ACE', explanation: 'ACE captures Ammo, Casualties, Equipment.' },
    ],
    completionBadge: 'Report Ready',
  },
  {
    id: 'new-battle-rhythm',
    title: 'Battle Rhythm',
    estimatedTime: '5 minutes',
    summary: 'BUB, CUB, LOGSYNC, maintenance meeting, and why on-time reporting matters.',
    contentBlocks: [
      { heading: 'Why Meetings Exist', body: 'Good meetings turn scattered updates into decisions, priorities, and synchronized action.' },
      { heading: 'Be Useful', body: 'Bring facts, risks, recommendations, and short updates. Rambling is not a running estimate.' },
    ],
    checks: [
      { prompt: 'What makes a useful update?', options: ['BLUF, status, risk, recommendation', 'Every detail in chronological order', 'No recommendation'], answer: 'BLUF, status, risk, recommendation', explanation: 'Commanders need decisions, not fog.' },
    ],
  },
  {
    id: 'new-warrior',
    title: 'Warrior Tasks Refresher',
    estimatedTime: '8 minutes',
    summary: 'Links the Soldier into SALUTE, MARCH, indirect fire, MEDEVAC, and signals practice.',
    contentBlocks: [
      { heading: 'Practice Loop', body: 'Warrior tasks are perishable. Short, repeated reps build confidence before field stress.' },
    ],
    checks: [
      { prompt: 'Which module gives focused warrior task reps?', options: ['Warrior Task Arcade', 'Supply Depot', 'Certificate'], answer: 'Warrior Task Arcade', explanation: 'The arcade is built for repeated short training reps.' },
    ],
  },
  {
    id: 'new-convoy-basics',
    title: 'Convoy Basics',
    estimatedTime: '7 minutes',
    summary: 'SP, RP, checkpoints, march order, roles, breakdown, lost comms, CCP, and rally points.',
    contentBlocks: [
      { heading: 'Movement Terms', body: 'SP is the Start Point. RP is the Release Point. Checkpoints help the convoy report progress and stay oriented.' },
      { heading: 'Contingencies', body: 'Good convoy briefs cover breakdown, contact, lost comms, rollover, UAS sighting, route blockage, CCP, and rally points.' },
    ],
    checks: [
      { prompt: 'What does CCP mean?', options: ['Casualty Collection Point', 'Convoy Control Paper', 'Company Command Post only'], answer: 'Casualty Collection Point', explanation: 'A CCP is where casualties are collected for treatment/evacuation flow.' },
    ],
    completionBadge: 'Convoy Familiar',
  },
  {
    id: 'new-field-expectations',
    title: 'Field Expectations',
    estimatedTime: '5 minutes',
    summary: 'Accountability, readiness, water, safety, hygiene, maintenance, and professionalism.',
    contentBlocks: [
      { heading: 'Basics Win', body: 'Be where you are supposed to be, bring required gear, communicate early, drink water, maintain equipment, and help reset the area.' },
      { heading: 'Look Outward', body: 'Check on your buddy, your vehicle, your section, and the mission. Small actions prevent large problems.' },
    ],
    checks: [
      { prompt: 'Your buddy looks confused, hot, and stops sweating. What should you do?', options: ['Tell leadership and start heat injury response', 'Tell them to tough it out', 'Ignore it'], answer: 'Tell leadership and start heat injury response', explanation: 'Safety and medical concerns are urgent.' },
    ],
  },
  {
    id: 'new-acronyms',
    title: 'Common Acronyms',
    estimatedTime: '6 minutes',
    summary: 'SP, RP, CCP, LOGSTAT, SITREP, SALUTE, ACE, PCC, PCI, BUB, CUB, PMCS, NMC, FMC, FLE, TOC.',
    contentBlocks: [
      { heading: 'Acronym Discipline', body: 'Acronyms help when everyone understands them. Ask when you do not know; guessing silently causes mistakes.' },
    ],
    checks: [
      { prompt: 'PMCS', options: ['Preventive Maintenance Checks and Services', 'Primary Mission Command Signal', 'Personnel Movement Control Sheet'], answer: 'Preventive Maintenance Checks and Services', explanation: 'PMCS is basic equipment readiness discipline.' },
      { prompt: 'LOGSTAT', options: ['Logistics Status', 'Long Strategic Target', 'Local Guard Station'], answer: 'Logistics Status', explanation: 'LOGSTAT communicates logistics status.' },
      { prompt: 'FMC', options: ['Fully Mission Capable', 'Fuel Movement Cell', 'Field Medical Card'], answer: 'Fully Mission Capable', explanation: 'FMC indicates equipment is mission capable.' },
    ],
    completionBadge: 'Acronym Ace',
  },
  {
    id: 'new-useful-drill',
    title: 'How to Be Useful at Drill',
    estimatedTime: '5 minutes',
    summary: 'Practical behavior that makes sections better immediately.',
    contentBlocks: [
      { heading: 'Do Useful Things', body: 'Ask what needs to be done, take notes, learn section products, check equipment, communicate early, and do not disappear.' },
      { heading: 'Finish Strong', body: 'Clean up, reset, help others, and leave the unit better than you found it.' },
    ],
    checks: [
      { prompt: 'You do not understand the plan. What should you do?', options: ['Ask a clear question early', 'Pretend you understand', 'Wait until execution fails'], answer: 'Ask a clear question early', explanation: 'Good questions prevent bad execution.' },
    ],
  },
  {
    id: 'new-final',
    title: 'Final Check',
    estimatedTime: '8 minutes',
    summary: 'Mixed review: staff, acronyms, reports, convoy basics, and field judgment.',
    contentBlocks: [
      { heading: 'Final Check', body: 'This is a short confidence check for new Soldiers. Score 80 or better to earn Mission Ready.' },
    ],
    checks: [
      { prompt: 'Radio issue goes first to which staff section?', options: ['S6', 'S1', 'S2'], answer: 'S6', explanation: 'S6 handles signal and communications support.' },
      { prompt: 'Which report fits enemy or unusual activity?', options: ['SALUTE', 'PMCS', 'BUB'], answer: 'SALUTE', explanation: 'SALUTE reports observations.' },
      { prompt: 'What does SP mean?', options: ['Start Point', 'Supply Packet', 'Signal Post'], answer: 'Start Point', explanation: 'SP is Start Point.' },
      { prompt: 'What is the best drill habit?', options: ['Communicate early and help the section', 'Disappear until final formation', 'Only help if asked twice'], answer: 'Communicate early and help the section', explanation: 'Initiative and communication make you useful fast.' },
    ],
    completionBadge: 'Mission Ready',
  },
];
