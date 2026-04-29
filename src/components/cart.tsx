'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { CloseIcon } from './icons';
import Image from 'next/image';

export default function Cart() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Cart Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-sm bg-bjrng-black border-l border-white/10 z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold">Cart</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="w-6 h-6 hover:text-bjrng-orange transition-colors"
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {items.length === 0 ? (
            <p className="text-center text-white/60 py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-6 border-b border-white/10">
                  {item.image && (
                    <div className="relative w-24 h-24 bg-white/5 rounded">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold line-clamp-2">{item.title}</h3>
                    {item.size && <p className="text-xs text-white/60 mt-1">Size: {item.size}</p>}
                    <p className="text-sm font-semibold mt-2">₹{item.price.toLocaleString()}</p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mt-3 bg-white/5 w-fit rounded">
                      <button
                        onClick={() =>
                          item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/10 transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/10 transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-bjrng-orange hover:text-white transition-colors mt-3"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 md:p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{total.toLocaleString()}</span>
            </div>
            <button className="w-full bg-bjrng-orange text-bjrng-black py-3 font-semibold hover:opacity-90 transition-opacity rounded">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
