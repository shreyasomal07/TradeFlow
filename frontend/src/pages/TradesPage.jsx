/**
 * TradesPage.jsx — Public Ledger & Personal Trade History
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  User,
  Globe,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Trash2,
  DollarSign
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatNumber, formatTime, formatDate } from '../utils/formatters';

export const TradesPage = () => {
  const { trades, stocks, clearTrades } = useMarket();
  const { user, isAuthenticated } = useAuth();

  const [tradeViewMode, setTradeViewMode] = useState(() => (isAuthenticated ? 'PERSONAL' : 'ALL')); // 'ALL' or 'PERSONAL'
  const [selectedStockFilter, setSelectedStockFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const currentUsername = user?.username?.toLowerCase() || '';
  const currentUserId = user?.userId?.toLowerCase() || '';

  const isUserTrade = (tr) => {
    if (!currentUsername && !currentUserId) return false;
    const buyer = tr.buyer?.toLowerCase();
    const seller = tr.seller?.toLowerCase();
    return (
      buyer === currentUsername ||
      buyer === currentUserId ||
      seller === currentUsername ||
      seller === currentUserId
    );
  };

  const filteredTrades = trades.filter((tr) => {
    if (tradeViewMode === 'PERSONAL' && !isUserTrade(tr)) {
      return false;
    }
    if (selectedStockFilter !== 'ALL' && tr.stockSymbol !== selectedStockFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = tr.tradeId?.toLowerCase().includes(q);
      const matchBuyer = tr.buyer?.toLowerCase().includes(q);
      const matchSeller = tr.seller?.toLowerCase().includes(q);
      if (!matchId && !matchBuyer && !matchSeller) return false;
    }
    return true;
  });

  const totalValueTraded = filteredTrades.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const totalSharesTraded = filteredTrades.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Trade Execution History
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {tradeViewMode === 'PERSONAL'
              ? `Viewing executed trades for @${user?.username || 'trader_user'}`
              : 'Real-time public transaction ledger executed across all market participants.'}
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mode Switcher: Personal vs All Market */}
          <div className="flex items-center bg-[#101623] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setTradeViewMode('PERSONAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                tradeViewMode === 'PERSONAL'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Trades ({trades.filter(isUserTrade).length})</span>
            </button>

            <button
              onClick={() => setTradeViewMode('ALL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                tradeViewMode === 'ALL'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Market ({trades.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search trade ID / trader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#101623] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-48 transition-colors"
            />
          </div>

          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            className="bg-[#101623] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="ALL">All Stocks</option>
            {stocks.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol}
              </option>
            ))}
          </select>

          {trades.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
              title="Clear all trade history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">
              {tradeViewMode === 'PERSONAL' ? 'Your Executed Trades' : 'Total Market Trades'}
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {formatNumber(filteredTrades.length)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">
              {tradeViewMode === 'PERSONAL' ? 'Your Trading Volume' : 'Total Market Turnover'}
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {formatCurrency(totalValueTraded)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Shares Exchanged</div>
            <div className="text-2xl font-black font-mono text-purple-400 mt-1">
              {formatNumber(totalSharesTraded)} shares
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Trades Ledger Table */}
      <div className="glass-panel rounded-2xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTrades.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2 font-mono">
              <History className="w-8 h-8 mx-auto opacity-30" />
              <p>
                {tradeViewMode === 'PERSONAL'
                  ? 'You have not executed any trades yet. Place a matching order on the dashboard to trade!'
                  : 'No executed trades found for the selected criteria.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-white/5 pb-2">
                  <th className="py-2 pl-2">Trade ID</th>
                  <th>Stock</th>
                  <th>Execution Price</th>
                  <th>Quantity</th>
                  <th>Total Turnover</th>
                  <th>Buyer ID</th>
                  <th>Seller ID</th>
                  <th className="text-right pr-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTrades.map((tr) => {
                  const isBuyerMe =
                    tr.buyer?.toLowerCase() === currentUsername ||
                    tr.buyer?.toLowerCase() === currentUserId.toLowerCase();
                  const isSellerMe =
                    tr.seller?.toLowerCase() === currentUsername ||
                    tr.seller?.toLowerCase() === currentUserId.toLowerCase();

                  return (
                    <tr key={tr.tradeId} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2 text-slate-400">
                        #{tr.tradeId?.substring(0, 10)}
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 font-bold">
                          {tr.stockSymbol}
                        </span>
                      </td>
                      <td className="font-bold text-white">
                        {formatCurrency(tr.price)}
                      </td>
                      <td className="text-cyan-400 font-bold">
                        {formatNumber(tr.quantity)}
                      </td>
                      <td className="text-emerald-400 font-bold">
                        {formatCurrency(tr.price * tr.quantity)}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            isBuyerMe
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {isBuyerMe ? `YOU (${tr.buyer})` : tr.buyer}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            isSellerMe
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isSellerMe ? `YOU (${tr.seller})` : tr.seller}
                        </span>
                      </td>
                      <td className="text-right pr-2 text-[11px] text-slate-400">
                        {formatDate(tr.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Clear All Trades Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#101623] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Clear Trade History?</h3>
              <p className="text-xs text-slate-400">
                This will delete executed trade records from the database and matching engine memory.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const isAll = tradeViewMode === 'ALL';
                  await clearTrades(
                    selectedStockFilter !== 'ALL' ? selectedStockFilter : null,
                    isAll
                  );
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
              >
                {tradeViewMode === 'PERSONAL' ? 'Clear My Trades' : 'Clear All Trades'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradesPage;
