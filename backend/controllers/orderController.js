/**
 * orderController.js — Controller for Orders & Order Book operations
 */

import { Order } from '../models/Order.js';
import { matchingService } from '../services/matchingService.js';

export async function getOrders(req, res) {
  try {
    const { symbol, status, userId, limit = 100 } = req.query;
    const filter = {};

    if (symbol) filter.stockSymbol = symbol.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (userId) {
      filter.$or = [
        { userId: userId },
        { userId: userId.toLowerCase() }
      ];
    }

    const orders = await Order.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function placeOrder(req, res) {
  try {
    const { stockSymbol, symbol, type, quantity, price, userId } = req.body;
    const sym = (stockSymbol || symbol)?.toUpperCase();

    if (!sym) {
      return res.status(400).json({ success: false, message: 'Stock symbol is required.' });
    }
    if (!type || (type !== 'BUY' && type !== 'SELL')) {
      return res.status(400).json({ success: false, message: 'Order type must be BUY or SELL.' });
    }
    const numPrice = Number(price);
    const numQty = Number(quantity);

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
    }
    if (isNaN(numQty) || numQty <= 0 || !Number.isInteger(numQty)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive whole number.' });
    }

    const result = await matchingService.placeOrder({
      stockSymbol: sym,
      type,
      quantity: numQty,
      price: numPrice,
      userId: userId || 'trader_user'
    });

    res.status(201).json({
      success: true,
      message: `Order placed successfully (${result.order.status})`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function cancelOrder(req, res) {
  try {
    const orderId = req.params.id;
    const { symbol } = req.query;

    const cancelledOrder = await matchingService.cancelOrder(orderId, symbol);

    res.json({
      success: true,
      message: `Order ${orderId} cancelled successfully.`,
      data: cancelledOrder
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getOrderBook(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const depth = matchingService.getOrderBookDepth(symbol);
    res.json({ success: true, data: depth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getDataStructuresDebug(req, res) {
  try {
    const symbol = (req.params.symbol || 'ABC').toUpperCase();
    const state = matchingService.getDataStructuresState(symbol);
    res.json({ success: true, data: state });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function clearOrders(req, res) {
  try {
    const { userId, all = 'false' } = req.query;
    let filter = {};
    if (all !== 'true' && userId) {
      filter = {
        $or: [
          { userId: userId },
          { userId: userId.toLowerCase() }
        ]
      };
    } else if (all !== 'true') {
      filter = { userId: 'trader_user' };
    }

    const ordersToClear = await Order.find(filter);
    for (const ord of ordersToClear) {
      if (ord.status === 'OPEN' || ord.status === 'PARTIALLY_FILLED') {
        try {
          await matchingService.cancelOrder(ord.orderId, ord.stockSymbol);
        } catch (e) {
          // ignore if already removed
        }
      }
    }

    const result = await Order.deleteMany(filter);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} orders successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

