const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');

// Try to require a DB connection if available. The original code used ESM and top-level await,
// which doesn't work with this CommonJS app. We'll attempt to require the CommonJS-friendly
// connector at `../db/conn.js` and fall back to an in-memory empty array if unavailable.
let db;
try {
    db = require('../db/conn');
} catch (e) {
    // DB connector not available or failed to load; we'll log and continue with fallback behavior
    console.warn('DB connector not available:', e.message || e);
    db = null;
}

const r = Router();

// GET /reports - return list of reports from DB if available, otherwise an empty array
r.get('/', async (req, res) => {
    try {
        if (db && typeof db.collection === 'function') {
            const collection = await db.collection('records');
            const results = await collection.find({}).toArray();
            return res.status(200).json(results);
        }

        // Fallback: return empty array (no DB configured)
        return res.status(200).json([]);
    } catch (err) {
        console.error('Error fetching reports:', err);
        return res.status(500).json(new SuccessResponseObject('Failed to fetch reports'));
    }
});

module.exports = r;
