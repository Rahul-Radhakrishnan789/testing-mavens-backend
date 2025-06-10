import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupSocket } from './sockets/index.js'
import morgan from 'morgan';

dotenv.config();
connectDB();
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
