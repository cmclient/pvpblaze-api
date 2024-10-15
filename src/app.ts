import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { loadCache } from './utils/cache';

dotenv.config();

const app = express();
const port = 2083;

console.log("PVPBlaze Leaderboard Api v1.0.0");
console.log("© Copyright 2024 CMCLIENT.");

const privateKey = fs.readFileSync('cert/privkey1.pem', 'utf8');
const certificate = fs.readFileSync('cert/cert1.pem', 'utf8');
const ca = fs.readFileSync('cert/chain1.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => console.log(`Listening on https://127.0.0.1:${port}`));

app.use(express.json());
app.use(cors({
    origin: ['https://www.pvpblaze.net', 'https://pvpblaze.net'],
    methods: 'GET',
    credentials: true,
}));


app.use('/', apiRouter);

loadCache();
setInterval(() => loadCache(), 10000);