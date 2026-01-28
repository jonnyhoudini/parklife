const express = require('express');
const helmet = require('helmet');
const { ErrorResponseObject } = require('./common/http');
const routes = require('./routes');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());
// CORS Middleware
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
    ATLAS_URI=mongodb+srv://jmcaveety_db_user:HwnZDoaOHHVgdE80@cluster0.bch338l.mongodb.net/?appName=Cluster0
    DB_NAME=parklife
    BLOB_READ_WRITE_TOKEN=vercel_blob_rw_AW4JOsZWLpe9e6MW_VUhtQXCGgEq0AQtwChJ1Yy12AUanvk
    ALLOWED_ORIGINS=https://cllrmcphilemy.vercel.app
    NODE_ENV=production    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// serve uploaded files (development helper)
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.use('/', routes);

// default catch all handler
app.all('*', (req, res) => res.status(404).json(new ErrorResponseObject('route not defined')));

module.exports = app;
