import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { menuItems, MenuItem } from '@/data/menu';
import { X, Plus, Minus, Check } from 'lucide-react';

interface CustomizeItemModalProps {
  baseItem: MenuItem | null;
  onClose: () => void;
}

const getNoteHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export function CustomizeItemModal({ baseItem, onClose }: CustomizeItemModalProps) {
  const { language, t, cart, addToCart, updateQuantity, playSound } = useApp();
  const [addons, setAddons] = useState<Record<string, number>>({});
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [spiceLevel, setSpiceLevel] = useState<'normal' | 'spicy'>('normal');
  const [withoutRaisins, setWithoutRaisins] = useState<boolean>(false);
  const [withoutNuts, setWithoutNuts] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (baseItem) {
      setAddons({});
      setSpiceLevel('normal');
      setWithoutRaisins(false);
      setWithoutNuts(false);
      setNote('');
      setItemQuantity(1);
    }
  }, [baseItem]);

  const addonItems = useMemo(
    () => menuItems.filter(i => ['sauces', 'salads', 'sides'].includes(i.category)),
    []
  );

  if (!baseItem) return null;

  const isMainCourse = baseItem.category === 'main' || baseItem.category === 'walaem';

  const updateAddon = (id: string, qty: number) => {
    setAddons(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const total =
    (baseItem.price +
    Object.entries(addons).reduce((sum, [id, qty]) => {
      const it = menuItems.find(i => i.id === id);
      return sum + (it?.price || 0) * qty;
    }, 0)) * itemQuantity;

  const handleConfirm = () => {
    let nameExclusionAr = '';
    let nameExclusionEn = '';
    if (withoutRaisins) {
      nameExclusionAr += ' (بدون زبيب)';
      nameExclusionEn += ' (No Raisins)';
    }
    if (withoutNuts) {
      nameExclusionAr += ' (بدون مكسرات)';
      nameExclusionEn += ' (No Nuts)';
    }

    const trimmedNote = note.trim();
    const noteHash = trimmedNote ? `note-${getNoteHash(trimmedNote)}` : '';
    
    // Construct customized ID including spice, raisins, nuts, and note hash
    const customizedItemId = [
      baseItem.id,
      spiceLevel,
      withoutRaisins ? 'noraisins' : '',
      withoutNuts ? 'nonuts' : '',
      noteHash
    ].filter(Boolean).join('-');

    const existing = cart.find(i => i.id === customizedItemId);
    const isSpicy = spiceLevel === 'spicy';
    
    const finalItem = {
      ...baseItem,
      id: customizedItemId,
      nameAr: `${baseItem.nameAr} (${isSpicy ? 'حار' : 'عادي'})${nameExclusionAr}`,
      nameEn: `${baseItem.nameEn} (${isSpicy ? 'Spicy' : 'Normal'})${nameExclusionEn}`,
      note: trimmedNote || undefined,
    };

    if (existing) {
      updateQuantity(customizedItemId, existing.quantity + itemQuantity);
    } else {
      addToCart(finalItem);
      if (itemQuantity > 1) {
        updateQuantity(customizedItemId, itemQuantity);
      }
    }

    // Add addons
    Object.entries(addons).forEach(([id, qty]) => {
      const it = menuItems.find(i => i.id === id);
      if (!it) return;
      for (let j = 0; j < qty * itemQuantity; j++) {
        addToCart(it);
      }
    });

    playSound('success');
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="bg-card rounded-3xl shadow-premium-lg w-full max-w-lg max-h-[90vh]
                   overflow-hidden animate-scale-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-secondary text-secondary-foreground p-4 flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {language === 'ar' ? 'تخصيص الطلب' : 'Customize Order'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary-foreground/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h4 className="font-bold text-foreground mb-1">
              {language === 'ar' ? baseItem.nameAr : baseItem.nameEn}
            </h4>
            {baseItem.descriptionAr && (
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? baseItem.descriptionAr : baseItem.descriptionEn}
              </p>
            )}
          </div>



          {/* Spice Level Picker - Only for main courses */}
          {isMainCourse && (
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-sm text-muted-foreground mb-2">
                  {language === 'ar' ? 'اختر مستوى الحرارة' : 'Choose spice level'}
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpiceLevel('normal')}
                    className={`p-3 rounded-xl border-2 text-right transition-all flex items-center justify-between ${
                      spiceLevel === 'normal' ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    <span className="text-sm">
                      {language === 'ar' ? 'عادي (غير حار)' : 'Normal (Not Spicy)'}
                    </span>
                    {spiceLevel === 'normal' && <Check className="w-4 h-4 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpiceLevel('spicy')}
                    className={`p-3 rounded-xl border-2 text-right transition-all flex items-center justify-between ${
                      spiceLevel === 'spicy' ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    <span className="text-sm flex items-center gap-1">
                      🌶️ {language === 'ar' ? 'حار' : 'Spicy'}
                    </span>
                    {spiceLevel === 'spicy' && <Check className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-sm text-muted-foreground mb-2">
                  {language === 'ar' ? 'تفضيلات خاصة' : 'Special Preferences'}
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithoutRaisins(!withoutRaisins)}
                    className={`p-3 rounded-xl border-2 text-right transition-all flex items-center justify-between ${
                      withoutRaisins ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    <span className="text-sm">
                      {language === 'ar' ? 'بدون زبيب' : 'Without Raisins'}
                    </span>
                    {withoutRaisins && <Check className="w-4 h-4 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithoutNuts(!withoutNuts)}
                    className={`p-3 rounded-xl border-2 text-right transition-all flex items-center justify-between ${
                      withoutNuts ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    <span className="text-sm">
                      {language === 'ar' ? 'بدون مكسرات' : 'Without Nuts'}
                    </span>
                    {withoutNuts && <Check className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add-ons */}
          {isMainCourse && (
            <div>
              <h5 className="font-semibold text-sm text-muted-foreground mb-2">
                {language === 'ar' ? 'إضافات (سلطات، صوصات، مقبلات)' : 'Add-ons (salads, sauces, sides)'}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {addonItems.map(item => {
                  const qty = addons[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        qty > 0 ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1 line-clamp-1">
                        {language === 'ar' ? item.nameAr : item.nameEn}
                      </div>
                      <div className="text-xs text-primary font-bold mb-2">
                        {item.price} {t.sar}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateAddon(item.id, qty - 1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-6 text-center">{qty}</span>
                        <button
                          onClick={() => updateAddon(item.id, qty + 1)}
                          className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions note */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <h5 className="font-semibold text-sm text-muted-foreground">
              {language === 'ar' ? 'ملاحظات خاصة لهذا الصنف' : 'Special Instructions for this item'}
            </h5>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={100}
              className="w-full p-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              placeholder={language === 'ar' ? 'مثال: بدون بصل، صوص إضافي…' : 'e.g. No onions, extra sauce…'}
            />
            {note && (
              <p className="text-[10px] text-muted-foreground text-end">{note.length}/100</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
            <span className="text-sm font-semibold text-foreground">
              {language === 'ar' ? 'الكمية' : 'Quantity'}
            </span>
            <div className="flex items-center gap-3 bg-muted/80 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setItemQuantity(q => Math.max(1, q - 1))}
                disabled={itemQuantity <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-card text-foreground hover:bg-muted active:scale-90 transition-all shadow-sm disabled:opacity-50"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-base w-6 text-center">{itemQuantity}</span>
              <button
                type="button"
                onClick={() => setItemQuantity(q => q + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 active:scale-90 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              {language === 'ar' ? 'الإجمالي' : 'Total'}
            </span>
            <span className="font-bold text-lg text-primary">
              {total.toFixed(2)} {t.sar}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full btn-secondary py-3 rounded-xl font-bold"
          >
            {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
