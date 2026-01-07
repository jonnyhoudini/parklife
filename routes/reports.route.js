const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');

// Try to require a DB connection if available. The original code used ESM and top-level await,
// which doesn't work with this CommonJS app. We'll attempt to require the CommonJS-friendly
// connector at `../db/conn.js` and fall back to an in-memory empty array if unavailable.
// DB connector may be CommonJS or ESM. We'll attempt to load it lazily inside the route
// handler to avoid require() failing on an ESM module with top-level await.
let dbConnector = null;

const r = Router();

// GET /reports - return list of reports from DB if available, otherwise an empty array
r.get('/', async (req, res) => {
    try {
        // Ensure we have a DB connector loaded. Try CommonJS require first,
        // then fall back to dynamic import for ESM modules.
        let connector = dbConnector;
        if (!connector) {
            try {
                connector = require('../db/conn');
            } catch (e) {
                try {
                    const mod = await import('../db/conn.js');
                    connector = mod.default || mod;
                } catch (impErr) {
                    console.warn('DB connector not available:', impErr.message || impErr);
                    connector = null;
                }
            }
            dbConnector = connector;
        }

        if (connector) {
            // connector may export a `connect()` function or be a db instance
            if (typeof connector.connect === 'function') {
                const database = await connector.connect();
                if (database) {
                    const collection = database.collection('records');
                    const results = await collection.find({}).toArray();
                    return res.status(200).json(results);
                }
            } else if (typeof connector.collection === 'function') {
                const collection = connector.collection('records');
                const results = await collection.find({}).toArray();
                return res.status(200).json(results);
            }
        }

        // Fallback: return in-memory reports (no DB configured)
        return res.status(200).json(memoryReports);
    } catch (err) {
        console.error('Error fetching reports:', err);
        return res.status(500).json(new SuccessResponseObject('Failed to fetch reports'));
    }
});

// In-memory fallback store when no DB is configured
const memoryReports = [];

// POST /reports - create a new report
r.post('/', async (req, res) => {
    try {
        const payload = req.body || {};
        const report = Object.assign({
            _id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
            dateSubmitted: new Date().toISOString(),
            status: 'open'
        }, payload);

        // ensure connector is loaded
        let connector = dbConnector;
        if (!connector) {
            try {
                connector = require('../db/conn');
            } catch (e) {
                try {
                    const mod = await import('../db/conn.js');
                    connector = mod.default || mod;
                } catch (impErr) {
                    connector = null;
                }
            }
            dbConnector = connector;
        }

        if (connector && typeof connector.connect === 'function') {
            const database = await connector.connect();
            if (database) {
                const collection = database.collection('records');
                await collection.insertOne(report);
                return res.status(201).json(report);
            }
        } else if (connector && typeof connector.collection === 'function') {
            const collection = connector.collection('records');
            await collection.insertOne(report);
            return res.status(201).json(report);
        }

        // Fallback: store in memory
        memoryReports.push(report);
        return res.status(201).json(report);
    } catch (err) {
        console.error('Error creating report:', err);
        return res.status(500).json(new SuccessResponseObject('Failed to create report'));
    }
});

// PUT /reports/:id - update a report
r.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body || {};

        let connector = dbConnector;
        if (!connector) {
            try {
                connector = require('../db/conn');
            } catch (e) {
                try {
                    const mod = await import('../db/conn.js');
                    connector = mod.default || mod;
                } catch (impErr) {
                    connector = null;
                }
            }
            dbConnector = connector;
        }

        if (connector && typeof connector.connect === 'function') {
            const database = await connector.connect();
            if (database) {
                const collection = database.collection('records');
                await collection.updateOne({ _id: id }, { $set: updates });
                const updated = await collection.findOne({ _id: id });
                return res.status(200).json(updated);
            }
        } else if (connector && typeof connector.collection === 'function') {
            const collection = connector.collection('records');
            await collection.updateOne({ _id: id }, { $set: updates });
            const updated = await collection.findOne({ _id: id });
            return res.status(200).json(updated);
        }

        // Fallback: update in-memory
        const idx = memoryReports.findIndex(rp => rp._id === id);
        if (idx === -1) return res.status(404).json(new SuccessResponseObject('Report not found'));
        memoryReports[idx] = Object.assign({}, memoryReports[idx], updates);
        return res.status(200).json(memoryReports[idx]);
    } catch (err) {
        console.error('Error updating report:', err);
        return res.status(500).json(new SuccessResponseObject('Failed to update report'));
    }
});

// DELETE /reports/:id - remove a report
r.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        let connector = dbConnector;
        if (!connector) {
            try {
                connector = require('../db/conn');
            } catch (e) {
                try {
                    const mod = await import('../db/conn.js');
                    connector = mod.default || mod;
                } catch (impErr) {
                    connector = null;
                }
            }
            dbConnector = connector;
        }

        if (connector && typeof connector.connect === 'function') {
            const database = await connector.connect();
            if (database) {
                const collection = database.collection('records');
                await collection.deleteOne({ _id: id });
                return res.status(200).json({ deleted: true });
            }
        } else if (connector && typeof connector.collection === 'function') {
            const collection = connector.collection('records');
            await collection.deleteOne({ _id: id });
            return res.status(200).json({ deleted: true });
        }

        // Fallback: remove from memory
        const idx = memoryReports.findIndex(rp => rp._id === id);
        if (idx === -1) return res.status(404).json(new SuccessResponseObject('Report not found'));
        memoryReports.splice(idx, 1);
        return res.status(200).json({ deleted: true });
    } catch (err) {
        console.error('Error deleting report:', err);
        return res.status(500).json(new SuccessResponseObject('Failed to delete report'));
    }
});

module.exports = r;
