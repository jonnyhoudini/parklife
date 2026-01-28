const { MongoClient } = require('mongodb');

const connectionString = process.env.ATLAS_URI || '';
const dbName = process.env.DB_NAME || 'parklife';

let client = null;
let cachedDb = null;

async function connect() {
    if (cachedDb) return cachedDb;
    if (!connectionString) {
        console.warn('No ATLAS_URI provided, using in-memory storage');
        return null;
    }
    try {
        // Add TLS options for Node.js v17+ compatibility
        const options = {
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 5000,
        };
        
        client = new MongoClient(connectionString, options);
        const conn = await client.connect();
        cachedDb = conn.db(dbName);
        console.log('✓ Connected to MongoDB:', dbName);
        return cachedDb;
    } catch (e) {
        console.error('✗ DB connection failed:', e.message || e);
        return null;
    }
}

module.exports = { connect };