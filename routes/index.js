const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');
const test = require('./test.route');
// import { ObjectId } from "mongodb";
const { ObjectId, MongoClient } = require("mongodb");
// const reports = require('./reports.route');
// import { MongoClient } from "mongodb";

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
    console.log('req.body', req.body);
    console.log('req', req);
    try {
        conn = await client.connect();
    } catch (e) {
        console.error(e);
    }
    let db = conn.db("sample_training");
    try {
        let newDocument = {
            "name": req.body.name,
            "category": req.body.category,
            "description": req.body.description,
            "location": req.body.location,
            "email": req.body.email,
            "address": req.body.address,
            "map": req.body.map,
            "housingType": req.body.housingType,
            "status": "open",
            "dateSubmitted": new Date(),
            "notes": ""
            // photo: req.file ? req.file.path : null, // Save the file path as part of the record
        };

        let collection = await db.collection("records");
        let results = await collection.insertOne(newDocument);
        res.send(results).status(200);
        // res.send(newDocument).status(200);
        // res.send(req).status(200);
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
    let db = conn.db("sample_training");
    let collection = db.collection("records");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});


r.get('/', (req, res) => res.json(new SuccessResponseObject('this is express vercel boiler plate')));

module.exports = r;
