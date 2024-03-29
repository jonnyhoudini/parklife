const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');
const test = require('./test.route');
import { ObjectId } from "mongodb";
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
    let db = conn.db("sample_training");
    try {
        let collection = await db.collection("records");
        let results = await collection.insertOne(req.body);
        res.send(results).status(200);
    } catch (e) {
        res.status(500).send({ message: 'error sending' });
    }
});

// delete a record
r.delete("/reports/:id", async (req, res) => {
    try {
        conn = await client.connect();
    } catch (e) {
        console.error(e);
    }
    let db = conn.db("sample_training");
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("records");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
});

// get a single record
r.get("/reports/:id", async (req, res) => {
    try {
        conn = await client.connect();
    } catch (e) {
        console.error(e);
    }
    let collection = await db.collection("records");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});


r.get('/', (req, res) => res.json(new SuccessResponseObject('express vercel boiler plate')));

module.exports = r;
