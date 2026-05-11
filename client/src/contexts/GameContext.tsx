import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  GameState, loadState, saveState, baseState,
  makeScenario, grade, levelFromXp, xpForLevel,
  type Stats, type Badge, type ResultData, type Difficulty, type Achievement,
} from '../lib/gameData';

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SCREEN'; screen: GameState['screen'] }
  | { type: 'SET_PLAYER'; player: GameState['player'] }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_CHALLENGE'; challenge: string }
  | { type: 'APPLY_EFFECTS'; effects: Partial<Stats> }
  | { type: 'SPEND_TIME'; minutes: number }
  | { type: 'ADD_CREDS'; amount: number }
  | { type: 'SPEND_CREDS'; amount: number }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_BADGE'; badge: Badge }
  | { type: 'ADD_ACHIEVEMENT'; achievement: Achievement }
  | { type: 'ADD_SHAME'; id: string; name: string; desc: string }
  | { type: 'ADD_LOG'; text: string }
  | { type: 'ADD_NOTEBOOK'; title: string; text: string }
  | { type: 'SET_LAST_RESULT'; result: ResultData | null }
  | { type: 'SET_MISSION_INDEX'; index: number }
  | { type: 'SET_STEP_INDEX'; index: number }
  | { type: 'ADD_MISSION_SCORE'; missionId: string; score: number; max: number }
  | { type: 'COMPLETE_MISSION'; missionId: string; score: number; max: number }
  | { type: 'BUY_ITEM'; itemId: string; cost: number }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'SET_SCENARIO'; scenario: GameState['scenario'] }
  | { type: 'SET_DAILY_DONE' }
  | { type: 'TTT_MOVE'; index: number }
  | { type: 'TTT_RESET' }
  | { type: 'CHESS_STEP'; step: number }
  | { type: 'SET_MINIGAME_SCORE'; game: string; score: number }
  | { type: 'RESET_GAME' }
  | { type: 'INIT_MISSION'; missionIndex: number }
  | { type: 'ADD_STREAK' }
  | { type: 'RESET_STREAK' }
  // New actions
  | { type: 'ADD_CHAOS'; amount: number }
  | { type: 'REDUCE_CHAOS'; amount: number }
  | { type: 'RESET_CHAOS' }
  | { type: 'SET_ACTIVE_COSMETIC'; id: string | null }
  | { type: 'UNLOCK_PPT_BOSS' }
  | { type: 'DEFEAT_PPT_BOSS' }
  | { type: 'ADD_CANDY'; amount: number }
  | { type: 'USE_CANDY' }
  | { type: 'SNEDIGAR_HIT' }
  | { type: 'BASH_DEFEATED' }
  | { type: 'USE_E4_FAVOR' }
  | { type: 'ADD_STORE_ITEM'; itemId: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function clamp(v: number, a = 0, b = 100) { return Math.max(a, Math.min(b, v)); }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_PLAYER':
      return { ...state, player: action.player };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty };
    case 'SET_CHALLENGE':
      return { ...state, challenge: action.challenge, scenario: null };
    case 'APPLY_EFFECTS': {
      const s = { ...state.stats };
      for (const [k, v] of Object.entries(action.effects)) {
        if (k in s) (s as any)[k] = clamp((s as any)[k] + (v as number));
      }
      return { ...state, stats: s };
    }
    case 'SPEND_TIME':
      return { ...state, timeBank: Math.max(0, state.timeBank - action.minutes) };
    case 'ADD_CREDS':
      return { ...state, creds: state.creds + action.amount };
    case 'SPEND_CREDS':
      return { ...state, creds: Math.max(0, state.creds - action.amount) };
    case 'ADD_XP': {
      const newXp = state.xp + action.amount;
      const newLevel = levelFromXp(newXp);
      return { ...state, xp: newXp, level: newLevel };
    }
    case 'ADD_BADGE': {
      if (state.badges[action.badge.id]) return state;
      const badges = { ...state.badges, [action.badge.id]: action.badge };
      const log = [new Date().toLocaleTimeString() + ': Badge: ' + action.badge.name, ...state.log].slice(0, 80);
      return { ...state, badges, log };
    }
    case 'ADD_ACHIEVEMENT': {
      if (state.achievements[action.achievement.id]) return state;
      const achievements = { ...state.achievements, [action.achievement.id]: action.achievement };
      const log = [new Date().toLocaleTimeString() + ': Achievement: ' + action.achievement.name, ...state.log].slice(0, 80);
      return { ...state, achievements, log };
    }
    case 'ADD_SHAME': {
      if (state.hall[action.id]) return state;
      const hall = { ...state.hall, [action.id]: { id: action.id, name: action.name, desc: action.desc } };
      return { ...state, hall };
    }
    case 'ADD_LOG': {
      const log = [new Date().toLocaleTimeString() + ': ' + action.text, ...state.log].slice(0, 80);
      return { ...state, log };
    }
    case 'ADD_NOTEBOOK': {
      const entry = { title: action.title, text: action.text, ts: Date.now() };
      return { ...state, notebook: [entry, ...state.notebook].slice(0, 100) };
    }
    case 'SET_LAST_RESULT':
      return { ...state, lastResult: action.result };
    case 'SET_MISSION_INDEX':
      return { ...state, missionIndex: action.index, stepIndex: 0 };
    case 'SET_STEP_INDEX':
      return { ...state, stepIndex: action.index };
    case 'ADD_MISSION_SCORE': {
      const prev = state.scores[action.missionId] || 0;
      return { ...state, scores: { ...state.scores, [action.missionId]: prev + action.score } };
    }
    case 'COMPLETE_MISSION': {
      const g = grade(action.score, action.max);
      const prev = state.missions[action.missionId];
      const attempts = (prev?.attempts || 0) + 1;
      const missions = {
        ...state.missions,
        [action.missionId]: { score: action.score, max: action.max, grade: g, attempts },
      };
      // Only mark completed if passed (70%+)
      const pct = action.max > 0 ? action.score / action.max : 0;
      const passed = pct >= 0.70;
      const completed = passed
        ? { ...state.completed, [action.missionId]: true }
        : state.completed;
      return { ...state, missions, completed };
    }
    case 'BUY_ITEM': {
      if (state.creds < action.cost) return state;
      const inventory = { ...state.inventory };
      inventory[action.itemId] = (inventory[action.itemId] || 0) + 1;
      let newState = { ...state, creds: state.creds - action.cost, inventory };
      // Track all bought items for achievements
      if (!newState.storeItemsBought.includes(action.itemId)) {
        newState = { ...newState, storeItemsBought: [...newState.storeItemsBought, action.itemId] };
      }
      // Apply immediate effects
      if (action.itemId === 'ray_card' || action.itemId === 'ray_favor') newState = { ...newState, rayCards: newState.rayCards + 1 };
      if (action.itemId === 'mercy') newState = { ...newState, mercyCards: newState.mercyCards + 1 };
      if (action.itemId === 'e4') newState = { ...newState, e4: true };
      if (action.itemId === 'secret_phrase') newState = { ...newState, secret: true };
      if (action.itemId === 'redbull') newState = { ...newState, redbull: newState.redbull + 4 };
      // Tornado: chaos+20 but gives XP
      if (action.itemId === 'tornado') {
        newState = { ...newState, chaosMeter: Math.min(100, newState.chaosMeter + 20), xp: newState.xp + 30 };
      }
      // Dorval call: go to dorval_call screen
      if (action.itemId === 'dorval_phone_call') {
        newState = { ...newState, screen: 'dorval_call' };
      }
      return newState;
    }
    case 'USE_ITEM': {
      const inventory = { ...state.inventory };
      if (!inventory[action.itemId]) return state;
      inventory[action.itemId] = Math.max(0, inventory[action.itemId] - 1);
      let newState = { ...state, inventory };
      // Cosmetics: set active cosmetic
      if (['beret','coffee_mug','whiteboard_marker','funny_hat','iron_man_mustache','aviator_glasses'].includes(action.itemId)) {
        newState = { ...newState, activeCosmeticId: action.itemId };
      }
      // Coffee: boost focus and clarity
      if (action.itemId === 'coffee' || action.itemId === 'coffee_mug') {
        const s = { ...newState.stats, focus: clamp(newState.stats.focus + 15), clarity: clamp(newState.stats.clarity + 10) };
        newState = { ...newState, stats: s };
      }
      // Aviator glasses: clarity+5
      if (action.itemId === 'aviator_glasses') {
        const s = { ...newState.stats, clarity: clamp(newState.stats.clarity + 5) };
        newState = { ...newState, stats: s };
      }
      // E4 truck favor
      if (action.itemId === 'e4_truck_favor') {
        newState = { ...newState, e4FavorUsed: true };
      }
      return newState;
    }
    case 'SET_SCENARIO':
      return { ...state, scenario: action.scenario };
    case 'SET_DAILY_DONE':
      return { ...state, dailyDone: true, dailyDate: new Date().toDateString() };
    case 'TTT_MOVE': {
      if (state.tttDone || state.ttt[action.index]) return state;
      const ttt = [...state.ttt];
      ttt[action.index] = state.tttTurn;
      const winner = checkTTT(ttt);
      const tttDone = !!winner || ttt.every(Boolean);
      return { ...state, ttt, tttTurn: state.tttTurn === 'X' ? 'O' : 'X', tttDone };
    }
    case 'TTT_RESET':
      return { ...state, ttt: Array(9).fill(''), tttTurn: 'X', tttDone: false };
    case 'CHESS_STEP':
      return { ...state, chessStep: action.step };
    case 'SET_MINIGAME_SCORE': {
      const prev = state.minigameScores[action.game] || 0;
      return { ...state, minigameScores: { ...state.minigameScores, [action.game]: Math.max(prev, action.score) } };
    }
    case 'RESET_GAME':
      return { ...baseState(), screen: 'title' };
    case 'INIT_MISSION': {
      const scenario = state.scenario || makeScenario(state.challenge);
      return {
        ...state,
        missionIndex: action.missionIndex,
        stepIndex: 0,
        scenario,
        scores: { ...state.scores, [`m${action.missionIndex + 1}`]: 0 },
      };
    }
    case 'ADD_STREAK':
      return { ...state, streak: state.streak + 1 };
    case 'RESET_STREAK':
      return { ...state, streak: 0 };
    // ─── New chaos actions ───
    case 'ADD_CHAOS':
      return { ...state, chaosMeter: Math.min(100, state.chaosMeter + action.amount) };
    case 'REDUCE_CHAOS':
      return { ...state, chaosMeter: Math.max(0, state.chaosMeter - action.amount) };
    case 'RESET_CHAOS':
      return { ...state, chaosMeter: 0 };
    case 'SET_ACTIVE_COSMETIC':
      return { ...state, activeCosmeticId: action.id };
    case 'UNLOCK_PPT_BOSS':
      return { ...state, pptBossUnlocked: true };
    case 'DEFEAT_PPT_BOSS':
      return { ...state, pptBossDefeated: true };
    case 'ADD_CANDY':
      return { ...state, candyCount: state.candyCount + action.amount };
    case 'USE_CANDY':
      return { ...state, candyCount: Math.max(0, state.candyCount - 1) };
    case 'SNEDIGAR_HIT':
      return { ...state, snedigarHits: state.snedigarHits + 1 };
    case 'BASH_DEFEATED':
      return { ...state, bashDefeated: true };
    case 'USE_E4_FAVOR':
      return { ...state, e4FavorUsed: true };
    case 'ADD_STORE_ITEM': {
      if (state.storeItemsBought.includes(action.itemId)) return state;
      return { ...state, storeItemsBought: [...state.storeItemsBought, action.itemId] };
    }
    default:
      return state;
  }
}

function checkTTT(board: string[]): string | null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  getScenario: () => NonNullable<GameState['scenario']>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const getScenario = useCallback(() => {
    if (state.scenario) return state.scenario;
    const s = makeScenario(state.challenge);
    dispatch({ type: 'SET_SCENARIO', scenario: s });
    return s;
  }, [state.scenario, state.challenge]);

  return (
    <GameContext.Provider value={{ state, dispatch, getScenario }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
