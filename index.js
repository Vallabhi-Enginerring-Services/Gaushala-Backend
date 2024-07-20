import express from 'express';
import mongoose from 'mongoose';
import { UserRouter } from './routes/user.js';
import { PaymentRouter } from './routes/paymentGateway.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { } from 'dotenv/config';

const app = express();
app.use(cors({
    origin: ["http://localhost:3000","http://localhost:3000/payment","http://localhost:3000/payment/verify"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use('/auth', UserRouter);
app.use('/payment', PaymentRouter);
 
mongoose.connect(process.env.mongoURL)

app.listen(3005, () => {
    console.log("Server is running")
})
