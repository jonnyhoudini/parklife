const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');
const test = require('./test.route');
// const reports = require('./reports.route');
import { MongoClient } from "mongodb";

const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString);

let conn;
// try {
//     conn = await client.connect();
// } catch (e) {
//     console.error(e);
// }

// let db = conn.db("sample_training");

const r = Router();

r.use('/demo', demo);

r.use('/test', test);

// r.use('/reports', reports);

// This section will get a list of all the reports.
r.get("/reports", async (req, res) => {
    try {
        conn = await client.connect();
    } catch (e) {
        console.error(e);
    }
    let db = conn.db("sample_training")
    let collection = await db.collection("records");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

// post a new record
r.post("/reports", async (req, res) => {
    try {
        conn = await client.connect();
    } catch (e) {
        console.error(e);
    }
    let db = conn.db("sample_training")
    try {
        let collection = await db.collection("records");
        let results = await collection.insertOne(req.body);
        res.send(results).status(200);
    } catch (e) {
        res.status(500).send({ message: 'error sending' });
    }
});


r.get('/', (req, res) => res.json(new SuccessResponseObject('express vercel boiler plate')));

module.exports = r;
