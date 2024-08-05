import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/features.js';
import cookieParser from 'cookie-parser';
import userRoute from './routers/userRouter.js';
import questionRoute from './routers/questionRouter.js';
import submissionRoute from './routers/submissionRouter.js';
import labRoute from './routers/labRouter.js';
import batchRoute from './routers/batchRouter.js';
import { errorMiddleware } from './middlewares/error.js';

const corsOptions = {
    origin: [ "http://localhost:3000", "https://api.jdoodle.com/v1/execute"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}

dotenv.config({
    path: "./config.env",
})

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 4173;

connectDB(mongoURI);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api/v1/user', userRoute);
app.use('/api/v1/question', questionRoute);
app.use('/api/v1/submission', submissionRoute);
app.use('/api/v1/lab', labRoute);
app.use('/api/v1/batch', batchRoute);

app.get('/', (req, res) => {
    res.send("This is IIT BBS");
})

app.use(errorMiddleware);

server.listen(port, () => {
    console.log(`Server is listening successfully at port ${port}`);
})

// Hi this is Saurav working here