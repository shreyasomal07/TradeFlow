/**
 * AnalyticsPage.jsx — Market Intelligence & Personal Trade Analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Zap,
  User,
  Globe,
  LogIn,
  UserPlus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

const PIE_COLORS = ['#10B981', '#EF4444'];

export const AnalyticsPage = () => {
  const { trades, orders, stocks } = useMarket();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  
  const [viewMode, setViewMode] = useState(() => (isAuthenticated ? 'PERSONAL' : 'MARKET')); // 'PERSONAL' | 'MARKET'
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        const res = await analyticsAPI.get();
        if (res.success && isMounted) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute Personal Analytics
  const personalStats = useMemo(() => {
    if (!user) {
      return {
        turnover: 0,
        tradesCount: 0,
        sharesTraded: 0,
        activeOrdersCount: 0,
        buyOrdersCount: 0,
        sellOrdersCount: 0,
        mostTradedStock: null,
        volumeByStock: [],
        buyVsSellData: [
          { name: 'BUY Orders', value: 0 },
          { name: 'SELL Orders', value: 0 }
        ]
      };
    }

    const currentUsername = user.username?.toLowerCase() || '';
    const currentUserId = user.userId?.toLowerCase() || '';

    // Filter User Trades
    const userTrades = trades.filter((tr) => {
      const b = tr.buyer?.toLowerCase();
      const s = tr.seller?.toLowerCase();
      return b === currentUsername || b === currentUserId || s === currentUsername || s === currentUserId;
    });

    // Filter User Orders
    const userOrders = orders.filter((o) => {
      const u = o.userId?.toLowerCase();
      return u === currentUsername || u === currentUserId;
    });

    const turnover = userTrades.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const sharesTraded = userTrades.reduce((sum, t) => sum + t.quantity, 0);
    const activeOrders = userOrders.filter((o) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED');

    const userBuyOrders = userOrders.filter((o) => o.type === 'BUY').length;
    const userSellOrders = userOrders.filter((o) => o.type === 'SELL').length;

    // Volume by Stock for user
    const stockMap = {};
    stocks.forEach((s) => {
      stockMap[s.symbol] = 0;
    });

    userTrades.forEach((t) => {
      const sym = t.stockSymbol;
      stockMap[sym] = (stockMap[sym] || 0) + (t.price * t.quantity);
    });

    const volumeByStock = Object.keys(stockMap).map((symbol) => ({
      symbol,
      volumeValue: stockMap[symbol]
    }));

    // Find most traded asset for user
    let maxVol = 0;
    let mostTraded = null;
    volumeByStock.forEach((item) => {
      if (item.volumeValue > maxVol) {
        maxVol = item.volumeValue;
        mostTraded = item;
      }
    });

    return {
      turnover,
      tradesCount: userTrades.length,
      sharesTraded,
      activeOrdersCount: activeOrders.length,
      buyOrdersCount: userBuyOrders,
      sellOrdersCount: userSellOrders,
      mostTradedStock: mostTraded,
      volumeByStock,
      buyVsSellData: [
        { name: 'BUY Orders', value: userBuyOrders },
        { name: 'SELL Orders', value: userSellOrders }
      ]
    };
  }, [user, trades, orders, stocks]);

  if (isLoading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 text-center text-slate-500 font-mono">
        Aggregating market metrics & analytics...
      </div>
    );
  }

  const isPersonal = viewMode === 'PERSONAL';

  const displayedTurnover = isPersonal ? personalStats.turnover : analytics.totalVolume;
  const displayedTrades = isPersonal ? personalStats.tradesCount : analytics.totalTrades;
  const displayedShares = isPersonal ? personalStats.sharesTraded : analytics.totalSharesTraded;
  const displayedActiveOrders = isPersonal ? personalStats.activeOrdersCount : analytics.activeOrdersCount;
  const displayedBuyCount = isPersonal ? personalStats.buyOrdersCount : analytics.buyOrdersCount;
  const displayedSellCount = isPersonal ? personalStats.sellOrdersCount : analytics.sellOrdersCount;
  const displayedMostTraded = isPersonal
    ? personalStats.mostTradedStock?.symbol || 'None'
    : analytics.mostTradedStock?.symbol || 'ABC';
  const displayedMostTradedVal = isPersonal
    ? personalStats.mostTradedStock?.volumeValue || 0
    : analytics.mostTradedStock?.volumeValue || 0;

  const displayedVolumeByStock = isPersonal ? personalStats.volumeByStock : analytics.volumeByStock;
  const displayedBuyVsSellData = isPersonal
    ? personalStats.buyVsSellData
    : [
        { name: 'BUY Bids', value: analytics.buyOrdersCount || 0 },
        { name: 'SELL Asks', value: analytics.sellOrdersCount || 0 }
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Market Intelligence & Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isPersonal
              ? `Personal portfolio metrics and execution performance analytics for @${user?.username || 'trader_user'}`
              : 'Real-time statistical breakdown of market turnover, liquidity distribution, and trade velocity.'}
          </p>
        </div>

        {/* View Mode Switcher: Personal vs Market */}
        <div className="flex items-center bg-[#101623] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('PERSONAL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              isPersonal
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Analytics</span>
          </button>

          <button
            onClick={() => setViewMode('MARKET')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              !isPersonal
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Market-Wide</span>
          </button>
        </div>
      </div>

      {/* Unauthenticated notice for Personal Analytics */}
      {isPersonal && !isAuthenticated && (
        <div className="glass-panel rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <LogIn className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Sign In for Personal Analytics</h3>
          <p className="text-xs text-slate-400">
            Sign in to your account to view your personal trading turnover, stock volume distribution, and order breakdown.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => openAuthModal('signin')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-black bg-cyan-500 hover:bg-cyan-400 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {(!isPersonal || isAuthenticated) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Turnover */}
          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">
                {isPersonal ? 'My Total Turnover' : 'Exchange Turnover'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {formatCurrency(displayedTurnover)}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              {isPersonal ? 'Total value traded by you' : 'Across all simulated assets'}
            </div>
          </div>

          {/* Total Trades */}
          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">
                {isPersonal ? 'My Executed Trades' : 'Total Trades Matched'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {formatNumber(displayedTrades)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {formatNumber(displayedShares)} shares exchanged
            </div>
          </div>

          {/* Active Orders */}
          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">
                {isPersonal ? 'My Active Orders' : 'Resting Orders in Heaps'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {formatNumber(displayedActiveOrders)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {displayedBuyCount} Bids / {displayedSellCount} Asks
            </div>
          </div>

          {/* Top Performer */}
          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">
                {isPersonal ? 'My Top Traded Asset' : 'Most Traded Asset'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {displayedMostTraded}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Turnover: {formatCurrency(displayedMostTradedVal)}
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {(!isPersonal || isAuthenticated) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Trading Volume by Stock (Bar Chart) — 7 cols */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                {isPersonal ? 'My Turnover Volume by Asset (₹)' : 'Exchange Turnover by Asset (₹)'}
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {isPersonal ? `@${user?.username}` : 'Live Aggregate'}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayedVolumeByStock} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="symbol" stroke="#384B6E" fontSize={11} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    stroke="#384B6E"
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Volume']}
                    contentStyle={{
                      backgroundColor: '#101623',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="volumeValue" fill="#00D2FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Buy vs Sell Distribution (Donut Chart) — 5 cols */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                {isPersonal ? 'My Placed Orders (Bids vs Asks)' : 'Market Liquidity (Bids vs Asks)'}
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Total: {displayedBuyCount + displayedSellCount}
              </span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayedBuyVsSellData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {displayedBuyVsSellData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} orders`, name]}
                    contentStyle={{
                      backgroundColor: '#101623',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 pt-2 border-t border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">BUY Orders ({displayedBuyCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-300">SELL Orders ({displayedSellCount})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
