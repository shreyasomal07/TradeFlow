import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowDownCircle, ArrowUpCircle, Check, AlertCircle, Sparkles, LogIn } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const OrderForm = ({ initialPrice = null, initialSide = 'BUY' }) => {
  const {
    stocks,
    selectedSymbol,
    setSelectedSymbol,
    selectedStock,
    orderBook,
    placeOrder
  } = useMarket();

  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [orderType, setOrderType] = useState('BUY'); // 'BUY' or 'SELL'
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Sync initial price if passed from order book click
  useEffect(() => {
    if (initialPrice) {
      setPrice(Number(initialPrice).toFixed(2));
    } else if (selectedStock) {
      setPrice(Number(selectedStock.currentPrice).toFixed(2));
    }
  }, [initialPrice, selectedStock]);

  useEffect(() => {
    if (initialSide) {
      setOrderType(initialSide);
    }
  }, [initialSide]);

  const numPrice = parseFloat(price) || 0;
  const numQty = parseInt(quantity, 10) || 0;
  const estimatedValue = numPrice * numQty;

  const handleBestBid = () => {
    if (orderBook?.bestBid) {
      setPrice(orderBook.bestBid.price.toFixed(2));
    }
  };

  const handleBestAsk = () => {
    if (orderBook?.bestAsk) {
      setPrice(orderBook.bestAsk.price.toFixed(2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!isAuthenticated || !user) {
      openAuthModal('signin');
      return;
    }

    if (!selectedSymbol) {
      setValidationError('Please select a stock.');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setValidationError('Price must be greater than ₹0.00.');
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      setValidationError('Quantity must be at least 1 share.');
      return;
    }

    try {
      setIsSubmitting(true);
      await placeOrder({
        stockSymbol: selectedSymbol,
        type: orderType,
        price: numPrice,
        quantity: numQty,
        userId: user?.username || user?.userId || 'trader_user'
      });
    } catch (err) {
      // Error is toasted in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBuy = orderType === 'BUY';

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-full space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Order Terminal
          </h3>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
          LIMIT ORDER
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* BUY / SELL Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#0B0F19] rounded-xl border border-white/5 gap-1">
          <button
            type="button"
            onClick={() => setOrderType('BUY')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isBuy
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>BUY</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('SELL')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isBuy
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>SELL</span>
          </button>
        </div>

        {/* Stock Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Select Asset
          </label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {stocks.map((stock) => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.symbol} — {stock.name} ({formatCurrency(stock.currentPrice)})
              </option>
            ))}
          </select>
        </div>

        {/* Limit Price Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-400">
              Limit Price (₹)
            </label>
            <div className="flex items-center gap-1 text-[10px]">
              <button
                type="button"
                onClick={handleBestBid}
                className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-mono font-bold"
              >
                Bid: {orderBook?.bestBid ? `₹${orderBook.bestBid.price}` : '--'}
              </button>
              <button
                type="button"
                onClick={handleBestAsk}
                className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-mono font-bold"
              >
                Ask: {orderBook?.bestAsk ? `₹${orderBook.bestAsk.price}` : '--'}
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-500">
              ₹
            </span>
            <input
              type="number"
              step="0.05"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-400">
              Order Quantity (Shares)
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Lot: 1</span>
          </div>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="50"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
            required
          />

          {/* Quick Quantity Multiplier Chips */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[10, 50, 100, 250].map((qtyVal) => (
              <button
                key={qtyVal}
                type="button"
                onClick={() => setQuantity(qtyVal.toString())}
                className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  numQty === qtyVal
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-[#0B0F19] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {qtyVal}
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Estimated Value</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCurrency(estimatedValue)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Execution Protocol</span>
            <span className="font-mono text-cyan-400">Price-Time Priority</span>
          </div>
        </div>

        {validationError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
            !isAuthenticated
              ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25 hover:shadow-cyan-500/40'
              : isBuy
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25 hover:shadow-emerald-500/40'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25 hover:shadow-rose-500/40'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <span>Processing via Engine...</span>
          ) : !isAuthenticated ? (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Place Order</span>
            </>
          ) : (
            <>
              <span>Place {orderType} Order</span>
              <span className="font-mono opacity-80">({formatCurrency(estimatedValue)})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
