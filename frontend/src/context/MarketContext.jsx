import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { stockAPI, orderAPI, tradeAPI, simulationAPI } from '../services/api';
import socket, { subscribeToStock, unsubscribeFromStock } from '../services/socket';
import { useAuth } from './AuthContext';

const MarketContext = createContext(null);

export const MarketProvider = ({ children }) => {
  const { user } = useAuth();

  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('ABC');
  const [selectedStock, setSelectedStock] = useState(null);
  const [orderBook, setOrderBook] = useState({
    symbol: 'ABC',
    bids: [],
    asks: [],
    spread: null,
    bestBid: null,
    bestAsk: null,
    lastTradedPrice: null,
    lastTradedQuantity: 0,
    buyOrderCount: 0,
    sellOrderCount: 0,
    totalBuyVolume: 0,
    totalSellVolume: 0,
    maxCumulativeVolume: 1
  });
  const [orders, setOrders] = useState([]);
  const [trades, setTrades] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [simulation, setSimulation] = useState({ isRunning: true, intervalMs: 3000 });
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [lastFlash, setLastFlash] = useState(null);

  // Add event to live activity feed
  const addActivity = useCallback((type, message, symbol = null) => {
    setActivityFeed((prev) => [
      {
        id: `ACT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        message,
        symbol,
        timestamp: new Date()
      },
      ...prev.slice(0, 49) // Keep last 50 events
    ]);
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const userKey = user?.username || user?.userId;
      const ordersPromise = userKey
        ? orderAPI.getAll({ userId: userKey, limit: 100 })
        : Promise.resolve({ success: true, data: [] });

      const [stocksRes, ordersRes, tradesRes, simRes] = await Promise.all([
        stockAPI.getAll(),
        ordersPromise,
        tradeAPI.getAll({ limit: 50 }),
        simulationAPI.getStatus()
      ]);

      if (stocksRes.success) {
        setStocks(stocksRes.data);
        const current = stocksRes.data.find((s) => s.symbol === selectedSymbol) || stocksRes.data[0];
        if (current) {
          setSelectedStock(current);
          setSelectedSymbol(current.symbol);
        }
      }

      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (tradesRes.success) setTrades(tradesRes.data || []);
      if (simRes.success) setSimulation(simRes.data);

      // Fetch order book for selected symbol
      const bookRes = await orderAPI.getBook(selectedSymbol);
      if (bookRes.success) {
        setOrderBook(bookRes.data);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      toast.error('Failed to connect to market server.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol, user]);

  // Load on mount or when user changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle stock symbol change
  const handleSelectSymbol = useCallback((symbol) => {
    if (!symbol) return;
    const clean = symbol.toUpperCase();
    unsubscribeFromStock(selectedSymbol);
    setSelectedSymbol(clean);
    
    const stock = stocks.find((s) => s.symbol === clean);
    if (stock) setSelectedStock(stock);

    subscribeToStock(clean);
    orderAPI.getBook(clean).then((res) => {
      if (res.success) setOrderBook(res.data);
    });
  }, [selectedSymbol, stocks]);

  // Place a new Order
  const handlePlaceOrder = async (orderData) => {
    try {
      const response = await orderAPI.placeOrder(orderData);
      if (response.success) {
        const { order, trades: executedTrades } = response.data;
        
        if (executedTrades && executedTrades.length > 0) {
          toast.success(
            `🚀 Order Matched! Executed ${executedTrades.length} trade(s) @ ₹${executedTrades[0].price}`
          );
          // Trigger confetti for trade fill
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        } else {
          toast.success(`📋 ${order.type} Order placed @ ₹${order.price} (${order.quantity} shares)`);
        }

        // Add to user orders list immediately
        setOrders((prev) => [order, ...prev.filter((o) => o.orderId !== order.orderId)]);
        return response.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(msg);
      throw err;
    }
  };

  // Cancel an Order
  const handleCancelOrder = async (orderId, symbol) => {
    try {
      const res = await orderAPI.cancelOrder(orderId, symbol);
      if (res.success) {
        toast.success(`Order #${orderId.substring(0, 8)} cancelled.`);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: 'CANCELLED' } : o))
        );
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel order';
      toast.error(msg);
      throw err;
    }
  };

  // Clear Order History
  const handleClearOrders = async (all = false) => {
    try {
      const userKey = user?.username || user?.userId;
      const res = await orderAPI.clearOrders({
        userId: all ? undefined : userKey,
        all: all ? 'true' : 'false'
      });
      if (res.success) {
        toast.success(res.message || 'Order history cleared.');
        setOrders([]);
        // Refresh order book depth
        const bookRes = await orderAPI.getBook(selectedSymbol);
        if (bookRes.success) {
          setOrderBook(bookRes.data);
        }
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to clear orders';
      toast.error(msg);
      throw err;
    }
  };

  // Clear Trade History
  const handleClearTrades = async (symbol = null, all = false) => {
    try {
      const userKey = user?.username || user?.userId;
      const params = {};
      if (symbol) params.symbol = symbol;
      if (all || !userKey) {
        params.all = 'true';
      } else {
        params.userId = userKey;
      }

      const res = await tradeAPI.clearTrades(params);
      if (res.success) {
        toast.success(res.message || 'Trade history cleared.');
        if (all) {
          setTrades([]);
        } else if (userKey) {
          const u = userKey.toLowerCase();
          setTrades((prev) =>
            prev.filter(
              (t) =>
                t.buyer?.toLowerCase() !== u &&
                t.seller?.toLowerCase() !== u &&
                t.buyer !== userKey &&
                t.seller !== userKey
            )
          );
        }
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to clear trade history';
      toast.error(msg);
      throw err;
    }
  };

  // Toggle Market Simulation
  const handleToggleSimulation = async () => {
    try {
      const res = await simulationAPI.toggle();
      if (res.success) {
        setSimulation(res.data);
        if (res.data.isRunning) {
          toast('🟢 Market Simulation: Running', { icon: '⚡' });
        } else {
          toast('🔴 Market Simulation: Paused', { icon: '⏸️' });
        }
      }
    } catch (err) {
      toast.error('Failed to toggle simulation');
    }
  };

  // Reset Market Data
  const handleResetData = async () => {
    try {
      const res = await stockAPI.resetData();
      if (res.success) {
        toast.success('Market data reset to defaults!');
        await fetchData();
      }
    } catch (err) {
      toast.error('Failed to reset market data');
    }
  };

  // Set up real-time Socket.IO event listeners
  useEffect(() => {
    subscribeToStock(selectedSymbol);

    // 1. Order Created
    const onOrderCreated = (newOrder) => {
      const currentKey = user?.username || user?.userId;
      const isMyOrder =
        currentKey &&
        (newOrder.userId?.toLowerCase() === currentKey.toLowerCase() ||
          newOrder.userId === currentKey);

      if (isMyOrder) {
        setOrders((prev) => {
          const exists = prev.some((o) => o.orderId === newOrder.orderId);
          if (exists) {
            return prev.map((o) => (o.orderId === newOrder.orderId ? newOrder : o));
          }
          return [newOrder, ...prev];
        });
      }

      addActivity(
        'ORDER_CREATED',
        `New ${newOrder.type} order for ${newOrder.quantity} ${newOrder.stockSymbol} @ ₹${newOrder.price}`,
        newOrder.stockSymbol
      );
    };

    // 2. Order Updated
    const onOrderUpdated = (updatedOrder) => {
      const currentKey = user?.username || user?.userId;
      const isMyOrder =
        currentKey &&
        (updatedOrder.userId?.toLowerCase() === currentKey.toLowerCase() ||
          updatedOrder.userId === currentKey);

      if (isMyOrder) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === updatedOrder.orderId ? { ...o, ...updatedOrder } : o))
        );
      }

      if (updatedOrder.status === 'PARTIALLY_FILLED') {
        addActivity(
          'ORDER_PARTIAL',
          `Order #${updatedOrder.orderId.substring(0, 8)} partially filled (${updatedOrder.filledQuantity}/${updatedOrder.quantity})`,
          updatedOrder.stockSymbol
        );
      }
    };

    // 3. Order Cancelled
    const onOrderCancelled = (cancelledOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === cancelledOrder.orderId ? { ...o, status: 'CANCELLED' } : o))
      );

      addActivity(
        'ORDER_CANCELLED',
        `Order #${cancelledOrder.orderId.substring(0, 8)} cancelled`,
        cancelledOrder.stockSymbol
      );
    };

    // 4. Trade Executed
    const onTradeExecuted = (trade) => {
      setTrades((prev) => [trade, ...prev.slice(0, 99)]);

      addActivity(
        'TRADE_EXECUTED',
        `Trade Executed: ${trade.quantity} ${trade.stockSymbol} @ ₹${trade.price}`,
        trade.stockSymbol
      );
    };

    // 5. Order Book Updated
    const onOrderBookUpdated = (newDepth) => {
      if (newDepth && newDepth.symbol === selectedSymbol) {
        setOrderBook(newDepth);
      }
    };

    // 6. Market Price Updated
    const onMarketPriceUpdated = (priceUpdate) => {
      setStocks((prev) =>
        prev.map((s) => {
          if (s.symbol === priceUpdate.symbol) {
            const oldPrice = s.currentPrice;
            const isUp = priceUpdate.currentPrice >= oldPrice;
            setLastFlash({ symbol: priceUpdate.symbol, direction: isUp ? 'UP' : 'DOWN' });
            return { ...s, ...priceUpdate };
          }
          return s;
        })
      );

      if (selectedSymbol === priceUpdate.symbol) {
        setSelectedStock((prev) => (prev ? { ...prev, ...priceUpdate } : prev));
      }
    };

    // 7. Simulation Status
    const onSimulationStatus = (status) => {
      setSimulation(status);
    };

    socket.on('orderCreated', onOrderCreated);
    socket.on('orderUpdated', onOrderUpdated);
    socket.on('orderCancelled', onOrderCancelled);
    socket.on('tradeExecuted', onTradeExecuted);
    socket.on('orderBookUpdated', onOrderBookUpdated);
    socket.on('marketPriceUpdated', onMarketPriceUpdated);
    socket.on('simulationStatus', onSimulationStatus);

    return () => {
      socket.off('orderCreated', onOrderCreated);
      socket.off('orderUpdated', onOrderUpdated);
      socket.off('orderCancelled', onOrderCancelled);
      socket.off('tradeExecuted', onTradeExecuted);
      socket.off('orderBookUpdated', onOrderBookUpdated);
      socket.off('marketPriceUpdated', onMarketPriceUpdated);
      socket.off('simulationStatus', onSimulationStatus);
    };
  }, [selectedSymbol, addActivity]);

  return (
    <MarketContext.Provider
      value={{
        stocks,
        selectedSymbol,
        selectedStock,
        orderBook,
        orders,
        trades,
        activityFeed,
        simulation,
        activePage,
        isLoading,
        lastFlash,
        setSelectedSymbol: handleSelectSymbol,
        setActivePage,
        placeOrder: handlePlaceOrder,
        cancelOrder: handleCancelOrder,
        clearOrders: handleClearOrders,
        clearTrades: handleClearTrades,
        toggleSimulation: handleToggleSimulation,
        resetMarketData: handleResetData,
        refreshData: fetchData
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};

export default MarketContext;
