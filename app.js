const express = require('express');
const helmet = require('helmet');
const { ErrorResponseObject } = require('./common/http');
const routes = require('./routes');

const app = express();

// CORS Middleware (must be first)
app.use((req, res, next) => {
    // ALLOWED_ORIGINS can be a comma-separated list, e.g.:
    // ALLOWED_ORIGINS=http://localhost:3000,https://cllrmcphilemy.vercel.app
    // Include the React dev server default (http://localhost:3001) in allowed origins
    const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,https://cllrmcphilemy.vercel.app')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const origin = req.headers.origin;

    // In development allow the requesting origin (convenience). In production, only allow configured origins.
    if (process.env.NODE_ENV === 'development') {
        if (origin) res.header('Access-Control-Allow-Origin', origin);
    } else {
        if (origin && allowed.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
        } else {
            // Fallback to the first allowed origin
            res.header('Access-Control-Allow-Origin', allowed[0] || '*');
        }
    }

    // Indicate responses can vary by Origin for correct caching behavior
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Allow credentials if needed
    res.header('Access-Control-Allow-Credentials', 'true');
    // Handle preflight requests
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());

// serve uploaded files (development helper)
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.use('/', routes);

// default catch all handler
app.all('*', (req, res) => res.status(404).json(new ErrorResponseObject('route not defined')));

module.exports = app;
