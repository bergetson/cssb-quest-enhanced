import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, MilButton, MilTag, SectionTitle, Divider } from '../../components/GameUI';
import { SHOP_ITEMS, CHARS, type ShopItem } from '../../lib/gameData';
import { toast } from 'sonner';

// Items that can be "used" from inventory
const USABLE_ITEMS: Record<string, { label: string; desc: string }> = {
  redbull:         { label: 'Crack it open', desc: '+20% XP on next question, but +8 chaos' },
  ray_card:        { label: 'Call in the favor', desc: 'SFC Ray saves your next wrong answer' },
  mercy:           { label: 'Play the card', desc: 'Auto-corrects one wrong input answer' },
  candy:           { label: 'Eat the candy', desc: '+5 chaos reduction. Mysteriously appeared.' },
  iron_man_mustache: { label: 'Equip / Unequip', desc: 'CPT Berget will comment.' },
  funny_hat:       { label: 'Equip / Unequip', desc: 'LTC Figarelli will use a big word.' },
  aviator_glasses: { label: 'Equip / Unequip', desc: 'You look like a pilot. You are not.' },
  beret:           { label: 'Equip / Unequip', desc: 'Morale improved.' },
  coffee_mug:      { label: 'Equip / Unequip', desc: 'Everyone approves.' },
  whiteboard_marker: { label: 'Equip / Unequip', desc: 'Does it have ink?' },
  tornado:         { label: 'Release the tornado', desc: 'Chaos event — for entertainment purposes only.' },
};

const COSMETIC_IDS = ['iron_man_mustache', 'funny_hat', 'aviator_glasses', 'beret', 'coffee_mug', 'whiteboard_marker'];

export default function StoreScreen() {
  const { state, dispatch } = useGame();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [tab, setTab] = useState<'shop' | 'inventory'>('shop');
  const [dorvalMode, setDorvalMode] = useState(false);

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
    if (item.id === 'dorval_phone_call' && (state.storeItemsBought.includes(item.id) || state.achievements.dorval_call)) {
      toast.info('You only get one BG Dorval phone call. Spend it wisely.');
      return;
    }
    dispatch({ type: 'BUY_ITEM', itemId: item.id, cost: item.cost });
    const speakerQuote = item.speakerLine.split(':').slice(1).join(':').trim();
    toast.success(`${item.name} acquired!`);
    if (speakerQuote) {
      setTimeout(() => toast.info(`${CHARS[item.speaker]?.emoji || ''} "${speakerQuote}"`), 600);
    }
    setSelectedItem(null);
  }

  function handleUseItem(itemId: string) {
    const isCosmetic = COSMETIC_IDS.includes(itemId);
    if (isCosmetic) {
      if (state.activeCosmeticId === itemId) {
        dispatch({ type: 'SET_ACTIVE_COSMETIC', id: null });
        toast.info('Cosmetic unequipped.');
      } else {
        dispatch({ type: 'SET_ACTIVE_COSMETIC', id: itemId });
        const comments: Record<string, string> = {
          iron_man_mustache: '🪖 "Looking sharp, soldier. Very Stark." — CPT Berget',
          funny_hat: '🎩 "The stratification of risk inherent in that headgear is... considerable." — LTC Figarelli',
          aviator_glasses: '🕶️ "You look like a pilot. You are not a pilot." — SGM',
          beret: '🪖 "Now THAT is a beret. Morale improved." — Staff',
          coffee_mug: '☕ "Morale improved. Carry on." — Everyone',
          whiteboard_marker: '✏️ "Does it have ink? Please tell me it has ink." — S3',
        };
        toast.success(comments[itemId] || 'Cosmetic equipped!');
      }
      return;
    }
    if (itemId === 'redbull') {
      dispatch({ type: 'USE_ITEM', itemId: 'redbull' });
      dispatch({ type: 'ADD_CHAOS', amount: 8 });
      toast.success('⚡ Red Bull consumed! +20% XP multiplier active. Chaos increased.');
      return;
    }
    if (itemId === 'candy') {
      dispatch({ type: 'USE_CANDY' });
      dispatch({ type: 'REDUCE_CHAOS', amount: 5 });
      toast.success('🍬 Candy consumed. Chaos reduced by 5. You feel strangely better.');
      return;
    }
    if (itemId === 'tornado') {
      dispatch({ type: 'USE_ITEM', itemId: 'tornado' });
      dispatch({ type: 'ADD_CHAOS', amount: 20 });
      toast.info('🌪️ Tornado released! Specialist Morgan and Sergeant Kimball are thrilled. Chaos +20.');
      return;
    }
    if (itemId === 'ray_card') {
      toast.info('🕶️ SFC Ray\'s favor is saved for your next wrong answer during a mission.');
      return;
    }
    if (itemId === 'mercy') {
      toast.info('🃏 Mercy Card is saved for your next wrong input during a mission.');
      return;
    }
    toast.info('This item activates automatically during missions.');
  }

  const colorMap: Record<string, string> = {
    gold: 'mil-card-gold', cyan: 'mil-card-cyan', green: 'mil-card-green',
    red: 'mil-card-red', orange: 'mil-card-orange', purple: 'mil-card-purple', lime: '',
  };

  // Inventory: all items the player owns
  const inventoryItems = Object.entries(state.inventory)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const shopItem = SHOP_ITEMS.find(s => s.id === id);
      return { id, qty, shopItem };
    });

  // Also add candy from candyCount
  const hasCandyInInventory = state.candyCount > 0;

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <div className="flex items-center justify-between mb-4">
          <SectionTitle color="orange">SUPPLY DEPOT</SectionTitle>
          <div className="text-right">
            <div className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{state.creds}</div>
            <div className="text-[10px] text-slate-500 mono">CREDITS</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab('shop')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'shop' ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/30' : 'text-slate-500 hover:text-slate-300'}`}
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            🛒 SHOP
          </button>
          <button
            onClick={() => setTab('inventory')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'inventory' ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30' : 'text-slate-500 hover:text-slate-300'}`}
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            🎒 INVENTORY ({inventoryItems.length + (hasCandyInInventory ? 1 : 0)})
          </button>
        </div>

        {/* SHOP TAB */}
        {tab === 'shop' && (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 mb-5 flex-wrap">
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
                const isOneTimeUsed = item.id === 'dorval_phone_call' && (state.storeItemsBought.includes(item.id) || !!state.achievements.dorval_call);

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
                          {isOneTimeUsed && <MilTag color="red">ONE CALL USED</MilTag>}
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
                          disabled={!canAfford || isOneTimeUsed}
                        >
                          {isOneTimeUsed ? 'ONE-TIME PURCHASE COMPLETE' : canAfford ? `BUY FOR ${item.cost} CR` : `NEED ${item.cost - state.creds} MORE CR`}
                        </MilButton>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Divider label="EARN MORE CREDITS" />
            <div className="grid grid-cols-3 gap-3">
              <div className="mil-card p-3 text-center">
                <div className="text-lg mb-1">🎯</div>
                <div className="text-xs text-yellow-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>MISSIONS</div>
                <div className="text-[10px] text-slate-500">Score ÷ 5 = credits</div>
              </div>
              <div className="mil-card p-3 text-center">
                <div className="text-lg mb-1">📅</div>
                <div className="text-xs text-yellow-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>DAILY</div>
                <div className="text-[10px] text-slate-500">+15 CR per day</div>
              </div>
              <div className="mil-card p-3 text-center">
                <div className="text-lg mb-1">🎮</div>
                <div className="text-xs text-yellow-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>MINI-GAMES</div>
                <div className="text-[10px] text-slate-500">Score ÷ 3</div>
              </div>
            </div>
          </>
        )}

        {/* INVENTORY TAB */}
        {tab === 'inventory' && (
          <div className="grid gap-3">
            {inventoryItems.length === 0 && !hasCandyInInventory ? (
              <div className="mil-card p-8 text-center">
                <div className="text-4xl mb-3">🎒</div>
                <div className="text-sm text-slate-500 mono">Your inventory is empty.</div>
                <div className="text-xs text-slate-600 mt-1">Buy items from the shop to use them here.</div>
              </div>
            ) : (
              <>
                {/* Candy (from Bailey) */}
                {hasCandyInInventory && (
                  <div className="mil-card mil-card-purple p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">🍬</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          Candy <span className="text-pink-400">×{state.candyCount}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Mysteriously appeared in your pocket.</div>
                        <div className="text-[10px] text-slate-600 italic mt-0.5">Reduces chaos by 5 when consumed.</div>
                      </div>
                      <MilButton color="purple" onClick={() => handleUseItem('candy')}>
                        EAT
                      </MilButton>
                    </div>
                  </div>
                )}

                {inventoryItems.map(({ id, qty, shopItem }) => {
                  const usable = USABLE_ITEMS[id];
                  const isEquipped = state.activeCosmeticId === id;
                  const isCosmetic = COSMETIC_IDS.includes(id);

                  return (
                    <div key={id} className={`mil-card p-4 ${isEquipped ? 'border-yellow-400/40' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{shopItem?.emoji || '📦'}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                              {shopItem?.name || id}
                            </span>
                            <span className="text-xs text-yellow-400 mono">×{qty}</span>
                            {isEquipped && <MilTag color="gold">EQUIPPED</MilTag>}
                          </div>
                          {usable && (
                            <div className="text-xs text-slate-400 mt-0.5">{usable.desc}</div>
                          )}
                        </div>
                        {usable && (
                          <MilButton
                            color={isEquipped ? 'orange' : 'cyan'}
                            onClick={() => handleUseItem(id)}
                          >
                            {isCosmetic ? (isEquipped ? 'UNEQUIP' : 'EQUIP') : 'USE'}
                          </MilButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}
