const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');
const test = require('./test.route');
const reports = require('./reports.route');

const r = Router();

r.use('/demo', demo);

r.use('/test', test);

r.use('/reports', reports);

// File upload endpoint using Vercel Blob
const multer = require('multer');
const { put } = require('@vercel/blob');

// Use memory storage for multer so we can upload the buffer to Vercel Blob
const upload = multer({ storage: multer.memoryStorage() });

r.post('/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('--- /upload route hit ---');
        console.log('Request headers:', req.headers);
        if (req.file) {
            console.log('File received:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        } else {
            console.log('No file received. Body:', req.body);
            return res.status(400).json({ error: 'no file uploaded' });
        }

        // Upload to Vercel Blob
        const blob = await put(req.file.originalname, req.file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        console.log('Blob upload success:', blob.url);
        return res.status(201).json({ url: blob.url });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'upload failed', message: err.message });
    }
});

r.get('/', (req, res) => res.json(new SuccessResponseObject('this is express vercel boiler plate')));

module.exports = r;
