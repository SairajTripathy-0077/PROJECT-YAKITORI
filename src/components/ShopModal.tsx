import { useState, useEffect, type FC } from 'react';
import { useGame } from '../context/GameContext';
import { X, ShoppingBag, Coins, Check, Lock, Sparkles } from 'lucide-react';
import { SpriteCharacter } from './SpriteCharacter';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal: FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const { playerStats, shopItems, purchaseItem, equipItem } = useGame();
  const [activeCategory, setActiveCategory] = useState<'all' | 'character' | 'equipment' | 'theme' | 'badge'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const characterCount = shopItems.filter(i => i.category === 'character').length;
  const equipmentCount = shopItems.filter(i => i.category === 'equipment').length;
  const badgeCount = shopItems.filter(i => i.category === 'badge').length;
  const themeCount = shopItems.filter(i => i.category === 'theme').length;

  const filteredItems = shopItems.filter(item => {
    if (item.category === 'drone') return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.effect.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="double-bezel max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        <div className="double-bezel-inner bg-[#ebeae4] text-[#111113] p-4 sm:p-5 border border-[#18181c] relative flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-[#18181c] pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#18181c] text-amber-400 border border-black shadow-pixel-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-pixel text-sm sm:text-base font-bold uppercase tracking-wider text-[#111113]">
                  PIXEL ARMORY & MARKETPLACE
                </h2>
                <p className="font-mono text-[11px] sm:text-xs text-[#4a4943] leading-tight">
                  Spend Gold Coins ($G) to unlock 192 pixel characters, combat gear, themes & badges
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#18181c]/20">
              <div className="flex items-center gap-1.5 bg-[#18181c] text-[#f5f4ef] px-3 py-1.5 font-mono text-xs font-bold border border-black shadow-pixel-sm">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 font-pixel text-xs">{playerStats.gold}g</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#4a4943] hover:text-black hover:bg-[#deddd6] border border-transparent hover:border-[#18181c] transition-all font-bold"
                title="Close armory (Esc)"
                aria-label="Close shop"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4 font-mono text-xs shrink-0">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { key: 'all', label: `All (${shopItems.length})` },
                { key: 'character', label: `🎭 Characters (${characterCount})` },
                { key: 'equipment', label: `⚔️ Equipment (${equipmentCount})` },
                { key: 'badge', label: `🎖️ Badges (${badgeCount})` },
                { key: 'theme', label: `📜 Themes (${themeCount})` },
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as any)}
                  className={`px-2.5 sm:px-3 py-1.5 uppercase transition-colors whitespace-nowrap text-[11px] sm:text-xs ${
                    activeCategory === cat.key
                      ? 'bg-[#18181c] text-[#f5f4ef] font-bold font-pixel border-2 border-black pixel-border-sm'
                      : 'bg-[#f5f4ef] text-[#4a4943] border border-[#18181c] hover:text-[#111113] hover:bg-[#deddd6]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Item Search Input */}
            <div className="relative w-full lg:w-60 shrink-0">
              <input
                type="text"
                placeholder="Search store items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#f5f4ef] border border-[#18181c] text-xs font-mono text-[#111113] placeholder:text-[#66655e] focus:outline-none focus:ring-1 focus:ring-[#18181c]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#66655e] hover:text-black font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[58vh] overflow-y-auto pr-1.5 flex-1">
            {filteredItems.map(item => {
              const canAfford = playerStats.gold >= item.price;

              return (
                <div key={item.id} className="p-3.5 bg-[#f5f4ef] border-2 border-[#18181c] flex flex-col justify-between font-mono text-xs shadow-pixel-sm hover:border-black hover:shadow-pixel transition-all">
                  <div>
                    <div className="flex items-start gap-2.5 mb-2">
                      {item.category === 'character' && item.spriteIndex !== undefined ? (
                        <div className="p-1 bg-[#ebeae4] border border-[#18181c] rounded flex items-center justify-center shrink-0 shadow-pixel-sm">
                          <SpriteCharacter index={item.spriteIndex} size={42} alt={item.name} />
                        </div>
                      ) : (
                        <span className="text-2xl p-2 bg-[#ebeae4] border border-[#18181c] rounded shrink-0 flex items-center justify-center">
                          {item.icon}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-pixel font-bold text-[#111113] text-xs leading-snug truncate" title={item.name}>
                          {item.name}
                        </h3>
                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wide block truncate mt-0.5">
                          {item.effect}
                        </span>
                      </div>
                    </div>

                    <p className="font-serif text-xs text-[#4a4943] my-2 leading-relaxed min-h-[3.25rem] line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Purchase / Equip Action Footer */}
                  <div className="pt-2 border-t border-[#18181c]/30 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-amber-700 font-bold">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-mono text-xs font-bold text-[#18181c]">{item.price}g</span>
                    </div>

                    {item.purchased ? (
                      item.equipped ? (
                        <span className="px-2.5 py-1 bg-[#18181c] text-[#f5f4ef] text-[10px] font-pixel uppercase font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-amber-400" />
                          EQUIPPED
                        </span>
                      ) : (
                        <button
                          onClick={() => equipItem(item.id)}
                          className="px-2.5 py-1 pixel-btn text-[10px] font-pixel uppercase font-bold"
                        >
                          EQUIP GEAR
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => purchaseItem(item.id)}
                        disabled={!canAfford}
                        className={`px-2.5 py-1 font-pixel text-[10px] uppercase font-bold flex items-center gap-1 ${
                          canAfford
                            ? 'pixel-btn-primary'
                            : 'bg-zinc-300 text-zinc-500 border-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? <Sparkles className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3" />}
                        <span>BUY ITEM</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
