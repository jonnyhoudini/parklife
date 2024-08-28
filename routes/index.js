const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');
const test = require('./test.route');

const r = Router();

r.use('/demo', demo);

r.use('/test', test);

r.post('/upload', (req, res) => {
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    res.send('file uploaded').status(200);
});

r.get('/', (req, res) => res.json(new SuccessResponseObject('this is express vercel boiler plate')));

module.exports = r;
