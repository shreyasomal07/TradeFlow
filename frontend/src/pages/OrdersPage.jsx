import React, { useState } from 'react';
import {
  FileText,
  Filter,
  Search,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  LogIn,
  UserPlus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import CancelOrderModal from '../components/CancelOrderModal';
import { formatCurrency, formatNumber, formatTime, formatDate, getStatusBadge } from '../utils/formatters';

export const OrdersPage = () => {
  const { orders, cancelOrder, clearOrders, setActivePage } = useMarket();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;
    if (symbolFilter && !ord.stockSymbol.toLowerCase().includes(symbolFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              My Orders
            </h1>
            {user && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold">
                @{user.username}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {user
              ? `Personal audit record of placed, partially filled, and executed limit orders for @${user.username}`
              : 'Sign in to view and manage your active and past limit orders.'}
          </p>
        </div>

        {/* Filter Bar & Clear Button */}
        {isAuthenticated && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by symbol..."
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
                className="bg-[#101623] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-44 transition-colors"
              />
            </div>

            <div className="flex items-center bg-[#101623] p-1 rounded-xl border border-white/5 text-xs">
              {['ALL', 'OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'PARTIALLY_FILLED' ? 'PARTIAL' : st}
                </button>
              ))}
            </div>

            {orders.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
                title="Clear all orders history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Unauthenticated State */}
      {!isAuthenticated && (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">Sign In to View Orders</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Create a new account or sign in to track your open limit orders and order history in real time.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal('signin')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-black bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Orders Table Card for Authenticated User */}
      {isAuthenticated && (
        <div className="glass-panel rounded-2xl p-5 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3 font-mono">
                <FileText className="w-10 h-10 mx-auto opacity-30 text-cyan-400" />
                <div className="space-y-1">
                  <p className="text-slate-300 font-bold text-sm">No Orders Found</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {orders.length === 0
                      ? 'Your account is brand new with zero order history! Place your first BUY or SELL limit order on the Trading Dashboard.'
                      : 'No orders match your selected filter criteria.'}
                  </p>
                </div>
                {orders.length === 0 && (
                  <button
                    onClick={() => setActivePage('dashboard')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all mt-2"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Go to Trading Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-white/5 pb-2">
                  <th className="py-2 pl-2">Order ID</th>
                  <th>Stock</th>
                  <th>Side</th>
                  <th>Limit Price</th>
                  <th>Quantity</th>
                  <th>Fill Progress</th>
                  <th>Status</th>
                  <th>Placed At</th>
                  <th className="text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const canCancel =
                    ord.status === 'OPEN' || ord.status === 'PARTIALLY_FILLED';
                  const fillPercent =
                    ord.quantity > 0
                      ? Math.round(((ord.quantity - ord.remainingQuantity) / ord.quantity) * 100)
                      : 0;

                  return (
                    <tr key={ord.orderId} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2 text-slate-400">
                        #{ord.orderId?.substring(0, 10)}
                      </td>
                      <td className="font-bold text-white">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                          {ord.stockSymbol}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`font-black ${
                            ord.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {ord.type}
                        </span>
                      </td>
                      <td className="font-bold text-white">
                        {formatCurrency(ord.price)}
                      </td>
                      <td className="text-slate-300">
                        {formatNumber(ord.quantity)}
                      </td>
                      <td className="w-32">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{fillPercent}%</span>
                            <span>{ord.remainingQuantity} rem</span>
                          </div>
                          <div className="w-full bg-[#0B0F19] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                ord.type === 'BUY' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-[11px] text-slate-400">
                        {formatDate(ord.timestamp)}
                      </td>
                      <td className="text-right pr-2">
                        {canCancel && (
                          <button
                            onClick={() => setSelectedOrderToCancel(ord)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all shadow-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <CancelOrderModal
        order={selectedOrderToCancel}
        isOpen={Boolean(selectedOrderToCancel)}
        onClose={() => setSelectedOrderToCancel(null)}
        onConfirm={(orderId, symbol) => cancelOrder(orderId, symbol)}
      />

      {/* Clear All Orders Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#101623] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Clear Order History?</h3>
              <p className="text-xs text-slate-400">
                This will delete your placed orders history and remove any active open orders from the matching engine heaps.
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
                  await clearOrders(false);
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
