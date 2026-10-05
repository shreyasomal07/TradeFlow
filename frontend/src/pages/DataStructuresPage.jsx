/**
 * DataStructuresPage.jsx — Comprehensive Data Structures & Website Architecture Guide
 */

import React, { useState } from 'react';
import {
  Binary,
  Layers,
  ArrowRight,
  Database,
  Search,
  CheckCircle2,
  Code2,
  Zap,
  Play,
  Check,
  Cpu,
  ArrowDownRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Activity,
  Globe,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const DataStructuresPage = () => {
  const [activeTab, setActiveTab] = useState('how-it-works'); // 'how-it-works' | 'data-structures' | 'matching-algorithm'
  
  // Interactive Matching Simulator State
  const [simStep, setSimStep] = useState(0);
  const [simBuyPrice, setSimBuyPrice] = useState(1250);
  const [simBuyQty, setSimBuyQty] = useState(100);
  const [simSellPrice, setSimSellPrice] = useState(1245);
  const [simSellQty, setSimSellQty] = useState(40);

  const simStepsList = [
    {
      step: 0,
      title: 'Initial State: Resting Sell Order in MinHeap',
      action: `sellOrders.insert({ orderId: "ORD_SELL_1", price: ₹${simSellPrice}, qty: ${simSellQty}, timestamp: T0 })`,
      explanation: `A seller placed an order to sell ${simSellQty} shares at ₹${simSellPrice}. It was inserted into the MinHeap and placed at root index 0 because ₹${simSellPrice} is currently the lowest ask price.`,
      dsEffect: `MinHeap Root: ₹${simSellPrice} (${simSellQty} shares) | OrderMap: Saved ORD_SELL_1 in O(1)`
    },
    {
      step: 1,
      title: 'Step 1: Incoming BUY Order Arrives',
      action: `matchingEngine.processOrder({ orderId: "ORD_BUY_1", type: 'BUY', price: ₹${simBuyPrice}, qty: ${simBuyQty}, timestamp: T1 })`,
      explanation: `A buyer submits a limit order to buy ${simBuyQty} shares at up to ₹${simBuyPrice}. The engine performs an O(1) peek() on the MinHeap root to inspect the lowest seller price (₹${simSellPrice}).`,
      dsEffect: `Condition Check: Buy Price (₹${simBuyPrice}) >= Best Ask (₹${simSellPrice}) → VALID MATCH!`
    },
    {
      step: 2,
      title: 'Step 2: Execution via Maker Price-Time Priority',
      action: `tradeQty = min(${simBuyQty}, ${simSellQty}) = ${Math.min(simBuyQty, simSellQty)} shares\nexecutionPrice = ₹${simSellPrice} (Maker Price Priority)`,
      explanation: `The trade executes at the resting maker order price (₹${simSellPrice}). ${Math.min(simBuyQty, simSellQty)} shares are traded. A new Trade object is created and appended to the Dynamic Trade Ledger.`,
      dsEffect: `Trade Record Generated → ${Math.min(simBuyQty, simSellQty)} shares @ ₹${simSellPrice} | Total Turnover: ₹${(Math.min(simBuyQty, simSellQty) * simSellPrice).toLocaleString('en-IN')}`
    },
    {
      step: 3,
      title: 'Step 3: Heap Rebalancing & Partial Fill Handling',
      action: `sellOrders.extractMin() // Sell order completely FILLED\nremainingBuyQty = ${simBuyQty} - ${Math.min(simBuyQty, simSellQty)} = ${simBuyQty - Math.min(simBuyQty, simSellQty)} shares\nbuyOrders.insert({ price: ₹${simBuyPrice}, qty: ${simBuyQty - Math.min(simBuyQty, simSellQty)} })`,
      explanation: `The resting sell order is completely filled and removed from the MinHeap via extractMin() in O(log n). The buyer still has ${simBuyQty - Math.min(simBuyQty, simSellQty)} remaining shares, which bubble up into the MaxHeap as a resting bid.`,
      dsEffect: `MaxHeap Root: ${simBuyQty - Math.min(simBuyQty, simSellQty)} shares @ ₹${simBuyPrice} | MinHeap: Next lowest ask becomes root`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      
      {/* Top Banner Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                <Binary className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Data Structures & Architecture Guide
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Academic demonstration of custom <span className="text-emerald-400 font-mono">MaxHeap</span>, <span className="text-rose-400 font-mono">MinHeap</span>, <span className="text-cyan-400 font-mono">Hash Map</span>, and Continuous Double-Auction matching algorithms.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0B0F19] p-1.5 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('how-it-works')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'how-it-works'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>How Website Works</span>
            </button>

            <button
              onClick={() => setActiveTab('data-structures')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'data-structures'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Data Structures Deep Dive</span>
            </button>

            <button
              onClick={() => setActiveTab('matching-algorithm')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'matching-algorithm'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Matching Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HOW THE WEBSITE WORKS (END-TO-END SYSTEM WORKFLOW) */}
      {/* ========================================================= */}
      {activeTab === 'how-it-works' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* High-Level Architecture Overview */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                End-to-End Trading Flow Architecture
              </h2>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              TradeFlow is structured as an institutional-grade, low-latency electronic trading exchange simulator. Unlike standard web apps that rely solely on slow database queries, TradeFlow maintains **in-memory Custom Data Structures (MaxHeap, MinHeap, Hash Map)** in RAM for instantaneous order matching, while persisting transactions to MongoDB and streaming updates via WebSockets.
            </p>

            {/* 4-Stage Visual Workflow Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-cyan-500/20 space-y-2 relative group hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10">
                    Input & Validation
                  </span>
                </div>
                <h3 className="text-xs font-black text-white">Order Placement</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Trader specifies Stock, Side (BUY/SELL), Price, and Quantity. Express backend validates inputs and tags user session.
                </p>
                <div className="text-[10px] font-mono text-cyan-300/80 pt-1 border-t border-white/5">
                  POST /api/orders
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-purple-500/20 space-y-2 relative group hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-mono font-bold text-xs flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-500/10">
                    In-Memory DS
                  </span>
                </div>
                <h3 className="text-xs font-black text-white">Matching Engine</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Order hits the stock's OrderBook. Compares against opposite heap root in <span className="text-purple-300 font-mono font-bold">O(1)</span> using Price-Time priority.
                </p>
                <div className="text-[10px] font-mono text-purple-300/80 pt-1 border-t border-white/5">
                  Continuous Double Auction
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-emerald-500/20 space-y-2 relative group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                    Persistence
                  </span>
                </div>
                <h3 className="text-xs font-black text-white">Trade Settlement</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Executions produce immutable Trade records. Orders update to FILLED / PARTIAL. Stored permanently in MongoDB.
                </p>
                <div className="text-[10px] font-mono text-emerald-300/80 pt-1 border-t border-white/5">
                  Mongoose + WiredTiger DB
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-amber-500/20 space-y-2 relative group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10">
                    Real-Time UI
                  </span>
                </div>
                <h3 className="text-xs font-black text-white">Socket.IO Broadcast</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Matching engine emits events: <code className="text-[10px] text-amber-300">orderBookUpdated</code>, <code className="text-[10px] text-amber-300">tradeExecuted</code>, <code className="text-[10px] text-amber-300">marketPriceUpdated</code> to all clients.
                </p>
                <div className="text-[10px] font-mono text-amber-300/80 pt-1 border-t border-white/5">
                  WebSocket Event Loop
                </div>
              </div>

            </div>
          </div>

          {/* Detailed Component Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 pb-2 border-b border-white/5">
                <Globe className="w-4 h-4" />
                <h3 className="text-xs font-black text-white uppercase">Frontend Layer (React + Vite)</h3>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>React Context API:</strong> Centralizes state for live Order Book depth, user orders, and market prices.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Socket.IO Client:</strong> Listens for sub-millisecond price ticks and market depth rebalancing without page refresh.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Recharts & Visualizers:</strong> Renders interactive candlestick charts and graphical heap tree nodes.</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 pb-2 border-b border-white/5">
                <Cpu className="w-4 h-4" />
                <h3 className="text-xs font-black text-white uppercase">Core Engine Layer (Node.js)</h3>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero External Libs for DS:</strong> `MaxHeap.js`, `MinHeap.js`, and `OrderBook.js` are custom engineered from scratch.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Deterministic Matching:</strong> Continuous double auction with exact Price-Time Priority.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Multi-Asset Isolation:</strong> Dedicated OrderBook instances for each traded stock (`ABC`, `XYZ`, `TECH`, `ENERGY`).</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-white/5">
                <Database className="w-4 h-4" />
                <h3 className="text-xs font-black text-white uppercase">Persistence Layer (MongoDB)</h3>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>User Account Isolation:</strong> BCrypt-hashed passwords, JWT tokens, and per-user order/trade tagging.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero-Friction Fallback:</strong> Auto-spins embedded MongoMemoryServer with persistent WiredTiger disk storage.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Heap Warm-Up on Startup:</strong> Reads all open limit orders from DB into MaxHeap/MinHeap memory on launch.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 2: DATA STRUCTURES DEEP DIVE (THE 4 CORE ALGORITHMS) */}
      {/* ======================================================= */}
      {activeTab === 'data-structures' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Grid of the 4 Data Structures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. MAX HEAP */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                    01
                  </span>
                  <h3 className="text-sm font-black text-white">Binary Max-Heap (BUY Orders / Bids)</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  O(1) Peek / O(log n) Insert
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                A complete binary tree stored in a contiguous array where every parent node has a price greater than or equal to its children. The root element at index <code className="text-emerald-400 font-mono">heap[0]</code> is always the <strong>Highest Bidder</strong> in the market.
              </p>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 space-y-2 text-[11px] font-mono">
                <div className="text-emerald-400 font-bold">// Array Index Mathematics</div>
                <div className="text-slate-300">Parent Index: <span className="text-cyan-400">Math.floor((i - 1) / 2)</span></div>
                <div className="text-slate-300">Left Child: <span className="text-cyan-400">2 * i + 1</span> | Right Child: <span className="text-cyan-400">2 * i + 2</span></div>
                <div className="text-slate-400 text-[10px] pt-1 border-t border-white/5">
                  Priority Invariant: Price DESC → Timestamp ASC (FIFO Tie-Breaker)
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-white text-[11px]">Key Methods:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li><strong className="text-slate-200">peek():</strong> Returns `heap[0]` in <strong>O(1)</strong> time.</li>
                  <li><strong className="text-slate-200">insert(order):</strong> Appends to array and runs <code className="text-emerald-300">bubbleUp()</code> in <strong>O(log n)</strong>.</li>
                  <li><strong className="text-slate-200">extractMax():</strong> Replaces root with last element and runs <code className="text-emerald-300">sinkDown()</code> in <strong>O(log n)</strong>.</li>
                </ul>
              </div>
            </div>

            {/* 2. MIN HEAP */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold">
                    02
                  </span>
                  <h3 className="text-sm font-black text-white">Binary Min-Heap (SELL Orders / Asks)</h3>
                </div>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  O(1) Peek / O(log n) Extract
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                A complete binary tree where every parent node has a price less than or equal to its children. The root element at index <code className="text-rose-400 font-mono">heap[0]</code> is always the <strong>Lowest Ask</strong> (cheapest seller) in the market.
              </p>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 space-y-2 text-[11px] font-mono">
                <div className="text-rose-400 font-bold">// Priority Comparator Logic</div>
                <div className="text-slate-300">if (child.price &lt; parent.price) <span className="text-emerald-400">return true; // Swap</span></div>
                <div className="text-slate-300">if (child.price === parent.price) <span className="text-cyan-400">return child.time &lt; parent.time;</span></div>
                <div className="text-slate-400 text-[10px] pt-1 border-t border-white/5">
                  Priority Invariant: Price ASC → Timestamp ASC (FIFO Tie-Breaker)
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-white text-[11px]">Key Methods:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li><strong className="text-slate-200">peek():</strong> Returns lowest seller at `heap[0]` in <strong>O(1)</strong>.</li>
                  <li><strong className="text-slate-200">insert(order):</strong> Inserts at bottom and runs <code className="text-rose-300">bubbleUp()</code> in <strong>O(log n)</strong>.</li>
                  <li><strong className="text-slate-200">extractMin():</strong> Removes filled ask and restores heap in <strong>O(log n)</strong>.</li>
                </ul>
              </div>
            </div>

            {/* 3. HASH MAP */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-l-4 border-l-cyan-500">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
                    03
                  </span>
                  <h3 className="text-sm font-black text-white">Hash Map (`orderMap` for O(1) Lookups)</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                  O(1) Instant Lookup
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Why do we need a Hash Map alongside Heaps? Because finding an arbitrary order by ID inside a binary heap takes <span className="text-rose-400 font-mono">O(n)</span> linear time. The Hash Map stores a direct reference to every active order.
              </p>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 space-y-2 text-[11px] font-mono">
                <div className="text-cyan-400 font-bold">// Hash Map Mapping Structure</div>
                <div className="text-slate-300">Key: <span className="text-amber-300">"ORD_1791178026066"</span> (Unique Order ID)</div>
                <div className="text-slate-300">Value: <span className="text-emerald-300">&#123; stockSymbol, type, price, qty, status &#125;</span></div>
                <div className="text-slate-400 text-[10px] pt-1 border-t border-white/5">
                  orderMap.get(orderId) → Instant O(1) Cancellation Verification
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-white text-[11px]">Why It Matters:</div>
                <p className="text-[11px] text-slate-400">
                  When a trader clicks <strong>Cancel Order</strong>, the system checks `orderMap.has(orderId)` in <strong>O(1)</strong>, marks the status to `CANCELLED`, and safely purges it without having to iterate through thousands of heap array elements.
                </p>
              </div>
            </div>

            {/* 4. DYNAMIC ARRAY & BUFFER */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-xs font-bold">
                    04
                  </span>
                  <h3 className="text-sm font-black text-white">Dynamic Array & Circular Timeline Buffer</h3>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  O(1) Amortized Append
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Maintains a chronological transaction log of all executed trades. Also powers the real-time stock price candlestick charts by maintaining a sliding window of the latest 150 historical data points.
              </p>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 space-y-2 text-[11px] font-mono">
                <div className="text-purple-400 font-bold">// Sliding Window History Buffer</div>
                <div className="text-slate-300">stock.history.push(&#123; timestamp, price, volume &#125;)</div>
                <div className="text-slate-300">if (stock.history.length &gt; 150) stock.history.shift();</div>
                <div className="text-slate-400 text-[10px] pt-1 border-t border-white/5">
                  Prevents memory leaks and maintains ultra-fast chart rendering
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-white text-[11px]">Applications:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li><strong>Public Trade Ledger:</strong> Immutable record of buyers, sellers, prices, and quantities.</li>
                  <li><strong>Market Analytics:</strong> Calculates 24h High, 24h Low, and Total Volume in real-time.</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Complexity Comparison Table */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Data Structures Theoretical Time Complexity Comparison</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[11px] uppercase text-slate-400 border-b border-white/10 pb-2">
                    <th className="py-2.5 pl-2">Data Structure</th>
                    <th>Find Best Price</th>
                    <th>Insert New Order</th>
                    <th>Remove Top Order</th>
                    <th>Lookup by Order ID</th>
                    <th>Overall Suitability for Matching Engine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="bg-emerald-500/5 text-slate-200">
                    <td className="py-3 pl-2 font-bold text-emerald-400">
                      Binary Heap (TradeFlow)
                    </td>
                    <td className="text-emerald-400 font-bold">O(1) (peek)</td>
                    <td className="text-emerald-400 font-bold">O(log n)</td>
                    <td className="text-emerald-400 font-bold">O(log n)</td>
                    <td className="text-cyan-400 font-bold">O(1) (via Map)</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        OPTIMAL (Used in Production)
                      </span>
                    </td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="py-3 pl-2 font-bold text-slate-300">Unsorted Array</td>
                    <td className="text-rose-400">O(n) (Linear scan)</td>
                    <td className="text-emerald-400">O(1)</td>
                    <td className="text-rose-400">O(n)</td>
                    <td className="text-rose-400">O(n)</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                        Unusable (Too Slow for Top Price)
                      </span>
                    </td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="py-3 pl-2 font-bold text-slate-300">Sorted Array</td>
                    <td className="text-emerald-400">O(1)</td>
                    <td className="text-rose-400">O(n) (Element shifting)</td>
                    <td className="text-emerald-400">O(1)</td>
                    <td className="text-amber-400">O(log n) (Binary search)</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                        Unusable (Slow O(n) Inserts)
                      </span>
                    </td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="py-3 pl-2 font-bold text-slate-300">Binary Search Tree (BST)</td>
                    <td className="text-amber-400">O(log n)</td>
                    <td className="text-amber-400">O(log n)</td>
                    <td className="text-amber-400">O(log n)</td>
                    <td className="text-amber-400">O(log n)</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                        Higher overhead / Can degenerate to O(n)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MATCHING ALGORITHM SIMULATOR (VIVA STEP WALKTHROUGH) */}
      {/* ======================================================== */}
      {activeTab === 'matching-algorithm' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Interactive Parameters Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-400" />
                  <span>Interactive Double-Auction Simulator</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust custom order parameters and step through the Continuous Double Auction matching algorithm.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimStep((prev) => Math.max(0, prev - 1))}
                  disabled={simStep === 0}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    simStep === 0
                      ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Previous Step
                </button>
                <button
                  onClick={() => setSimStep((prev) => Math.min(simStepsList.length - 1, prev + 1))}
                  disabled={simStep === simStepsList.length - 1}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    simStep === simStepsList.length - 1
                      ? 'opacity-40 cursor-not-allowed bg-purple-500/30 text-white'
                      : 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/25'
                  }`}
                >
                  Next Step ({simStep + 1}/{simStepsList.length})
                </button>
                <button
                  onClick={() => setSimStep(0)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Reset Simulator"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0B0F19] border border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-rose-400">Resting Sell Price (₹)</label>
                <input
                  type="number"
                  value={simSellPrice}
                  onChange={(e) => {
                    setSimSellPrice(Number(e.target.value));
                    setSimStep(0);
                  }}
                  className="w-full mt-1 bg-[#101623] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-rose-400">Resting Sell Qty (Shares)</label>
                <input
                  type="number"
                  value={simSellQty}
                  onChange={(e) => {
                    setSimSellQty(Number(e.target.value));
                    setSimStep(0);
                  }}
                  className="w-full mt-1 bg-[#101623] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-emerald-400">Incoming Buy Price (₹)</label>
                <input
                  type="number"
                  value={simBuyPrice}
                  onChange={(e) => {
                    setSimBuyPrice(Number(e.target.value));
                    setSimStep(0);
                  }}
                  className="w-full mt-1 bg-[#101623] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-emerald-400">Incoming Buy Qty (Shares)</label>
                <input
                  type="number"
                  value={simBuyQty}
                  onChange={(e) => {
                    setSimBuyQty(Number(e.target.value));
                    setSimStep(0);
                  }}
                  className="w-full mt-1 bg-[#101623] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {simStepsList.map((st, idx) => (
                <div
                  key={idx}
                  onClick={() => setSimStep(idx)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    simStep === idx
                      ? 'bg-purple-500/20 border-purple-500 text-white font-bold shadow-sm'
                      : simStep > idx
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#0B0F19] border-white/5 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-mono">STEP {idx}</div>
                  <div className="text-[11px] font-semibold truncate mt-0.5">{st.title.split(':')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Execution Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                Step {simStep} Execution Details
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                {simStepsList[simStep].title}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Code / Algorithm Block */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-white/5 space-y-2 font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold">// Engine Action Code</div>
                <pre className="text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {simStepsList[simStep].action}
                </pre>
                <div className="pt-2 border-t border-white/5 text-emerald-400 text-[11px]">
                  State: {simStepsList[simStep].dsEffect}
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Algorithmic Invariant:
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {simStepsList[simStep].explanation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs flex items-center justify-between">
                  <span>Price Matching Invariant:</span>
                  <span className="font-mono font-bold text-white">
                    {simBuyPrice >= simSellPrice ? `BUY (₹${simBuyPrice}) >= SELL (₹${simSellPrice}) → EXECUTE` : `BUY < SELL → REST IN BOOK`}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default DataStructuresPage;
