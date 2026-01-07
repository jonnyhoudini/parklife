const { MongoClient } = require('mongodb');

const connectionString = process.env.ATLAS_URI || '';
const dbName = process.env.DB_NAME || 'parklife';

let client = null;
let cachedDb = null;

async function connect() {
    if (cachedDb) return cachedDb;
    if (!connectionString) return null;
    try {
        client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        const conn = await client.connect();
        cachedDb = conn.db(dbName);
        console.log('Connected to MongoDB:', dbName);
        return cachedDb;
    } catch (e) {
        console.error('DB connection failed:', e.message || e);
        return null;
    }
}

module.exports = { connect };