import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import { cookieOption, sendToken } from '../utils/features.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

const emailTokens = {};
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PATH,
  }
});

const sendEmail = (email, subject, sharedToken) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: subject,
      text: `Your OTP for email verification for Code Forge is ${sharedToken}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } 
      else {
        resolve(info);
      }
    });
  });
}

const emailVerification = tryCatch(async(req, res, next) => {
  const { email } = req.body;
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expirationTime = new Date(Date.now() + 60 * 60 * 1000);
  emailTokens[email] = { otp, expirationTime };
  const sharedToken = `${otp}`;

  try {
    await sendEmail(email, "Email Verification", sharedToken);
    res.status(200).json({ success: true, message: "An OTP has been sent to your email." });
  } 
  catch (error) {
    next(new ErrorHandler("Failed to send OTP email", 500));
  }
})

const confirmOTP = tryCatch(async(req, res, next) => {
  const { email, otp } = req.body;
  const sharedOTP = emailTokens[email];
  if(sharedOTP && sharedOTP.otp == otp && Date.now() < sharedOTP.expirationTime) {
    return res.status(200).json({ success: true, message: "OTP has been successfully verified." });
  }
  else if(sharedOTP && sharedOTP.otp != otp) {
    return res.status(400).json({ success: false, message: "Incorrect OTP entered." });
  }
  else return res.status(400).json({ success: true, message: "OTP expired." });
})

const newUser = tryCatch(async (req, res, next) => {
  console.log("Hi");
  const {name, rollNumber, email, password, secretQuestion, secretAnswer } = req.body;

  if(!name || !rollNumber || !email || !password || !secretQuestion || !secretAnswer)
    return next(new ErrorHandler("Please fill all fields", 404));

  const file = req.file;
  if(file) {
    // code to store photo
  }

  const user = await User.create({
      name, rollNumber, email, password, secretQuestion, secretAnswer
  });

  sendToken(res, user, 200, `Welcome to Code Forge`);
});

const login = tryCatch(async(req, res, next) => {
  const {email, password} = req.body;
  if (!email || !password) {
      return next(new ErrorHandler("Email and password are required", 404));
  }

  const user = await User.findOne({ email }).select("+password");
  if(!user) return next(new ErrorHandler("Invalid credentials", 404));

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) return next(new ErrorHandler("Invalid credentials", 404));

  sendToken(res, user, 200, `Welcome back, ${user.name}`);
  return user;
})

const getMyProfile = tryCatch(async(req, res) => {
  const user = await User.findById(req.user);  
  res.status(200).json({
      success: true,
      user
  })
});

const logOut = tryCatch(async(req, res) => {
  return res
      .status(200)
      .cookie('token', "", { ...cookieOption, maxAge: 0})
      .json ({
          success: true,
          message: "Logged out successfully",
      });
});

export { emailVerification, confirmOTP, newUser, login, getMyProfile, logOut }