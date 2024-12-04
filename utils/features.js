import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const cookieOption = {
    maxAge: 15 * 24 * 60 * 60 * 1000, 
    sameSite: "none", 
    httpOnly: true, 
    secure: true, 
}

const connectDB = (uri) => {
    mongoose
        .connect(uri, {dbname: "iplNexus"})
        .then((data) => console.log(`Connected to MongoDb: ${data.connection.host}`))
        .catch((err) => { throw err })
};

const sendToken = (res, user, code, message) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    return res.status(code).cookie('token', token, cookieOption).json({
        success: true,
        user,
        message,
        role: user.role
    })
}

export { cookieOption, connectDB, sendToken };