import React from 'react';
import { CartItem } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  React.useEffect(() => {
    if (isOpen) {
      console.log('Cart drawer opened with items:', items.length);
    }
  }, [isOpen, items]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Winkelwagen ({items.reduce((a, b) => a + b.quantity, 0)})</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 118 0m-4 7v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m4 6V7a4 4 0 018 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <p className="text-slate-400 font-medium">Je winkelwagen is momenteel leeg.</p>
                <button 
                  onClick={onClose} 
                  className="text-[#FF4F00] font-black uppercase text-xs tracking-widest underline"
                >
                  Begin met shoppen
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="flex gap-6 items-center">
                  <div className="w-24 h-24 shrink-0 bg-slate-50 rounded-2xl overflow-hidden">
                    <img src={item.product.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{item.product.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.product.category}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-slate-100 rounded-full overflow-hidden">
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, -1)} 
                          className="px-3 py-1 hover:bg-slate-50 text-slate-400 hover:text-slate-900"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-black">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, 1)} 
                          className="px-3 py-1 hover:bg-slate-50 text-slate-400 hover:text-slate-900"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-black text-slate-900">€ {(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(item.product.id)} 
                    className="text-slate-200 hover:text-rose-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
          
          {items.length > 0 && (
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-6">
              <div className="flex justify-between items-center text-slate-900">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotaal</span>
                <span className="text-2xl font-black">€ {subtotal.toLocaleString()}</span>
              </div>
              <button 
                onClick={onCheckout} 
                className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs shadow-2xl hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1"
              >
                Afrekenen
              </button>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Veilig betalen via iDEAL, Creditcard e Bancontact</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;