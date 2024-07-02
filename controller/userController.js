import bcrypt, { hash } from 'bcrypt'
import multer from 'multer'
import User from '../models/userModel.js'
import Teacher from '../models/teacherModel.js'
import dotenv from 'dotenv'
import { cookieOption, sendToken } from '../utils/features.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler, sendEmail } from '../utils/utility.js';

dotenv.config();
const emailTokens = {};
let myUser;
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = tryCatch(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const sendOTP = async(email, message, next) => {
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expirationTime = new Date(Date.now() + (2 * 60 * 60 * 1000));
  const sharedToken = `${otp}`;

  try {
      await sendEmail(email, message, sharedToken);
      emailTokens[email] = {otp, expirationTime};
  } 
  catch (error) {
      next(new ErrorHandler("Failed to send OTP email", 500));
  }
}

const emailVerification = tryCatch(async(req, res, next) => {
  const { email, resetting } = req.body;
  if(!email) return next(new ErrorHandler("Please fill your email", 404));
  let secretQuestion = "";
  
  if(resetting) {
    const user = await User.findOne({ email });
    if(!user) return next(new ErrorHandler("User do not exists", 404));
    secretQuestion = user.secretQuestion;
  }

  let role;

  if(email[0] === '2') role = "student";
  else role = "teacher";

  sendOTP(email, "Email Verification", next);
  res.status(200).json({ success: true, role: role, secretQuestion: secretQuestion, message: "An OTP has been sent to your email." });
})

const confirmOTP = tryCatch(async(req, res, next) => {
  const { email, resetting, otp, secretAnswer } = req.body;
  if(!email || !otp) return next(new ErrorHandler("Please fill all fields", 404));

  if(resetting && !secretAnswer) return next(new ErrorHandler("Please fill secret answer", 404)); 

  const user = await User.findOne({ email });
  if(resetting && (secretAnswer !== user.secretAnswer)) return next(new ErrorHandler("Please give coreect answer", 404));

  const sharedOTP = emailTokens[email];

  if(sharedOTP && sharedOTP.otp == otp && Date.now() < sharedOTP.expirationTime) {
    return res.status(200).json({ success: true, message: "OTP has been successfully verified." });
  }
  else if(sharedOTP && sharedOTP.otp != otp) {
    return res.status(400).json({ success: false, message: "Incorrect OTP entered." });
  }
  else return res.status(400).json({ success: false, message: "OTP expired." });
})

const newUser = tryCatch(async (req, res, next) => {
  const { name, email, password, secretQuestion, secretAnswer } = req.body;
  console.log("Hi");

  if (!name || !email || !password || !secretQuestion || !secretAnswer) {
    return next(new ErrorHandler("Please fill all fields", 404));
  }

  let user;

  try {
    if (email[0] === '2') {
      console.log("student");
      const index = email.indexOf('@');
      const rollNumber = email.slice(0, index);

      user = await User.create({
        name, email, password, rollNumber, secretQuestion, secretAnswer
      });
    } else {
      console.log("teacher");
      user = await Teacher.create({ 
        name, email, password, secretQuestion, secretAnswer 
      });
    }

    console.log(user); // Log the created user

    // Send token and welcome message
    sendToken(res, user, 200, `Welcome to Code Forge`);

  } catch (error) {
    console.error('Error creating user:', error);
    return next(new ErrorHandler("An error occurred while creating the user", 500));
  }
});

const login = tryCatch(async(req, res, next) => {
  const {email, password} = req.body;
  if (!email || !password) {
      return next(new ErrorHandler("Please fill all the fields", 404));
  }

  let user;
  if(email[0] === '2') user = await User.findOne({ email }).select("+password"); 
  else user = await Teacher.findOne({ email }).select("+password");
 
  if(!user) return next(new ErrorHandler("Invalid credentials", 404));

  const isMatch = bcrypt.compare(password, user.password);
  if(!isMatch) return next(new ErrorHandler("Invalid credentials", 404));

  myUser = user;
  sendToken(res, user, 200, `Welcome back, ${user.name}`);
  return user;
})

const forgetPassword = tryCatch(async(req, res, next) => {
  const { email } = req.body;
  if(!email) 
    return next(new ErrorHandler("Please fill all the fields", 404));

  const user = await User.findOne({ email }).select("+password");
  if(!user) return next(new ErrorHandler("User do not exists", 404));
  
  sendOTP(email, "Forget Password", next);
  return res.status(200).json({ success: true, secretQuestion: user.secretQuestion });
})

const setNewPassword = tryCatch(async(req, res, next) => {
  const { email, password } = req.body;
  if(!email|| !password) return next(new ErrorHandler("Please fill all the fields", 404));

  const user = await User.findOne({ email });
  if(!user) return next(new ErrorHandler("User do not exists", 404));

  const newPassword = await hash(password, 10);
  user.password = newPassword;
  await user.save();

  return res.status(200).json({ success: true, user: user, message: "Password has been updated." });
})

const getMyProfile = tryCatch(async(req, res) => {
  const user = myUser;

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

export { newUser, login, forgetPassword, setNewPassword, getMyProfile, logOut, emailVerification, confirmOTP,uploadUserPhoto, resizeUserPhoto }