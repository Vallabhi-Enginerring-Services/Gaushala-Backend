import express from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/User.js'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email })
    if (user) {
        return res.json({ message: "user already existed" })
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
        username,
        email,
        password: hashPassword,
    })

    await newUser.save()
    return res.json({ status: true, message: "record registered", data: user })

})
router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) {
        return res.json({ message: "email is not registered" })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
        return res.json({ message: "password is incorrect" })
    }

    const token = jwt.sign({ username: username }, "jwtwebtokenadad", { expiresIn: '1h' })
    // console.log(token)
    res.cookie('token', token, {
        httpOnly: true, secure: false,
        sameSite: "none", maxAge: 360000
    })
    return res.json({ status: true, message: "login successfull", name: user.name })
})

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ message: "User not registered" })
        }

        const token = jwt.sign({ id: user._id }, "jwtwebtokenadad", { expiresIn: '5m' })
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'akhilesh.yadav@vallabhiindia.com',
                pass: 'uhpkaaqwkyaxpkwe'
            }
        });

        var mailOptions = {
            from: 'akhileshyadav26620@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `http://localhost:3000/resetPassword/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.json({ message: "error sending email" })
            } else {
                return res.json({ status: true, message: "email sent" })
            }
        });

    } catch (err) {
        console.log(err);
    }
})

router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    try {
        const decoded = jwt.verify(token, "jwtwebtokenadad")
        const id = decoded.id;
        const hashPassword = await bcrypt.hash(password, 10)
        await User.findByIdAndUpdate({ _id: id }, { password: hashPassword })
        return res.json({ status: true, message: "updated password" })
    } catch (err) {
        return res.json({ message: "invalid token" })
    }

})

const verifyUser = async (req, res, next) => {
    try {
        console.log(req.cookies)
        const token = req.cookies.token;
        if (!token) {
            return res.json({ status: false, message: "no token" })
        }
        const decoded = await jwt.verify(token, "jwtwebtokenadad");
        next();
    } catch (err) {
        return res.json(err);
    }
}

router.get("/verify", verifyUser, (req, res) => {
    return res.json({ status: true, message: "authorized" })
})
router.get("/logout", (req, res) => {
    res.clearCookie('token')
    return res.json({ status: true })
})



export { router as UserRouter }