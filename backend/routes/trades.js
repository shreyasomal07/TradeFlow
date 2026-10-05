/**
 * trades.js — Routes for Trades
 */

import express from 'express';
import { Trade } from '../models/Trade.js';
import { matchingService } from '../services/matchingService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { symbol, userId, limit = 100 } = req.query;
    const filter = {};
    if (symbol) {
      filter.stockSymbol = symbol.toUpperCase();
    }
    if (userId) {
      const u = userId.toLowerCase();
      filter.$or = [
        { buyer: userId },
        { buyer: u },
        { seller: userId },
        { seller: u }
      ];
    }
    const trades = await Trade.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: trades.length, data: trades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { symbol, userId, all = 'false' } = req.query;
    let filter = {};
    if (symbol) {
      filter.stockSymbol = symbol.toUpperCase();
    }
    if (all !== 'true' && userId) {
      const u = userId.toLowerCase();
      filter.$or = [
        { buyer: userId },
        { buyer: u },
        { seller: userId },
        { seller: u }
      ];
    }

    const result = await Trade.deleteMany(filter);
    if (!symbol && all === 'true') {
      matchingService.engine.tradeHistory = [];
    } else if (symbol && all === 'true') {
      matchingService.engine.tradeHistory = matchingService.engine.tradeHistory.filter(
        (t) => t.stockSymbol !== symbol.toUpperCase()
      );
    } else if (userId) {
      const u = userId.toLowerCase();
      matchingService.engine.tradeHistory = matchingService.engine.tradeHistory.filter(
        (t) =>
          t.buyer !== userId &&
          t.buyer?.toLowerCase() !== u &&
          t.seller !== userId &&
          t.seller?.toLowerCase() !== u
      );
    }

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} trade records successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
