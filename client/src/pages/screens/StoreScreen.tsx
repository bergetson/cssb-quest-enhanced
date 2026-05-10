import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, MilCard, MilButton, MilTag, SectionTitle, Divider } from '../../components/GameUI';
import { SHOP_ITEMS, CHARS, type ShopItem } from '../../lib/gameData';
import { toast } from 'sonner';

export default function StoreScreen() {
  const { state, dispatch } = useGame();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', 'consumable', 'powerup', 'cosmetic', 'secret'];

  const filtered = SHOP_ITEMS.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  function handleBuy(item: ShopItem) {
    if (state.creds < item.cost) {
      toast.error('Not enough credits. Earn more by completing missions.');
      return;
    }
    if (item.id === 'e4' && state.e4) {
      toast.info('E4 Mafia Alliance already active.');
      return;
    }
    dispatch({ type: 'BUY_ITEM', itemId: item.id, cost: item.cost });
    toast.success(`${item.name} acquired! ${item.speakerLine.split(':')[1]?.trim() || ''}`);
    setSelectedItem(null);
  }

  const colorMap: Record<string, string> = {
    gold: 'mil-card-gold',
    cyan: 'mil-card-cyan',
    green: 'mil-card-green',
    red: 'mil-card-red',
    orange: 'mil-card-orange',
    purple: 'mil-card-purple',
    lime: '',
  };

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <div className="flex items-center justify-between mb-6">
          <SectionTitle color="orange">SUPPLY DEPOT</SectionTitle>
          <div className="text-right">
            <div className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{state.creds}</div>
            <div className="text-[10px] text-slate-500 mono">CREDITS</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`mil-tag uppercase cursor-pointer transition-all ${filter === c ? 'mil-tag-gold' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid gap-3 mb-6">
          {filtered.map(item => {
            const owned = state.inventory[item.id] || 0;
            const canAfford = state.creds >= item.cost;
            const isSpecial = item.category === 'secret';

            return (
              <div
                key={item.id}
                className={`mil-card ${colorMap[item.color] || ''} p-4 cursor-pointer hover:-translate-y-0.5 transition-transform ${isSpecial ? 'animate-pulse-glow' : ''}`}
                onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.name}</span>
                      {owned > 0 && <MilTag color="green">OWNED ×{owned}</MilTag>}
                      <MilTag color={item.color}>{item.category}</MilTag>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    <p className="text-[10px] text-slate-600 mt-1 italic">{item.flavor}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-black ${canAfford ? 'text-yellow-400' : 'text-slate-600'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {item.cost}
                    </div>
                    <div className="text-[10px] text-slate-600 mono">CR</div>
                  </div>
                </div>

                {/* Expanded view */}
                {selectedItem?.id === item.id && (
                  <div className="mt-4 pt-4 border-t border-white/8 animate-fade-in-up">
                    <div className="info-box mb-3">
                      <div className="text-xs font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {CHARS[item.speaker]?.emoji} {CHARS[item.speaker]?.name}
                      </div>
                      <p className="text-xs italic">{item.speakerLine.split(':').slice(1).join(':').trim()}</p>
                    </div>
                    <MilButton
                      color={canAfford ? item.color : ''}
                      className="w-full"
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                    >
                      {canAfford ? `BUY FOR ${item.cost} CR` : `NEED ${item.cost - state.creds} MORE CR`}
                    </MilButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Divider label="EARN MORE CREDITS" />
        <div className="grid grid-cols-2 gap-3">
          <div className="mil-card p-3 text-center">
            <div className="text-lg mb-1">🎯</div>
            <div className="text-xs text-yellow-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>MISSIONS</div>
            <div className="text-[10px] text-slate-500">Score ÷ 2 = credits</div>
          </div>
          <div className="mil-card p-3 text-center">
            <div className="text-lg mb-1">📅</div>
            <div className="text-xs text-yellow-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>DAILY</div>
            <div className="text-[10px] text-slate-500">+50 CR per day</div>
          </div>
        </div>
      </div>
    </ScreenWrap>
  );
}
