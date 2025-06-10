import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import middleError from './middleware/error.middleware.js';
import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.route.js";    


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use(middleError)


export default app;
