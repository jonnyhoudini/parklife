const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
import db from "../db/conn.js";

const r = Router();

// This section will get a list of all the reports.
r.get("/", async (req, res) => {
    let collection = await db.collection("records");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

// r.get('/', (req, res) => res.json(new SuccessResponseObject('reports path live 🚀')));

module.exports = r;
