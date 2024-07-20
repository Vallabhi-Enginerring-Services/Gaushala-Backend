import express, { response } from 'express'
import { Cashfree } from 'cashfree-pg';
import crypto from 'crypto';
import { } from 'dotenv/config';

const router = express.Router();

Cashfree.XClientId = process.env.CLIENTID;
Cashfree.XClientSecret = process.env.cashkey;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;



const generateOrderId = () => {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);

    const orderId = hash.digest('hex');
    return orderId.substr(0, 12);
}



router.get('/', async (req, res) => {
    try {
        let request = {
            "order_amount": 1.00,
            "order_currency": "INR",
            "order_id": await generateOrderId(),
            "customer_details": {
                "customer_id": "vallabhi01",
                "customer_phone": "9999999999",
                "customer_name": "Vallabhi Enginering Services",
                "customer_email": "vallabhi@example.com",
            },
        }
        Cashfree.PGCreateOrder("2023-08-01", request).then(response => {
            res.json(response.data);
        }).catch(error => {
            console.log(error);
        })

    } catch (error) {
        console.log(error);
    }
})
router.post('/verify', async (req, res) => {
    try {
        Cashfree.PGOrderFetchPayments("2023-08-01",req.body.orderId).then((response)=>{
        res.json("Hello",response);
        }).catch(error=>{
        console.error("Error",error.response);
    })
    } catch (error) {
        console.log(error);
    }
})


export { router as PaymentRouter }