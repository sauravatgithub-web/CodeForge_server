import bcrypt, { hash } from 'bcrypt'
import multer from 'multer'
import User from '../models/userModel.js'
import dotenv from 'dotenv'
import { cookieOption, sendToken } from '../utils/features.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler, sendEmail } from '../utils/utility.js';

dotenv.config();
const emailTokens = {};
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

  sendOTP(email, "Email Verification", next);
  res.status(200).json({ success: true, secretQuestion: secretQuestion, message: "An OTP has been sent to your email." });
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
  const {name, rollNumber, email, password, secretQuestion, secretAnswer } = req.body;

  if(!name || !rollNumber || !email || !password || !secretQuestion || !secretAnswer)
    return next(new ErrorHandler("Please fill all fields", 404));

  const user = await User.create({
      name,
      email,
      password,
      rollNumber,  
      secretQuestion, 
      secretAnswer
  });

  sendToken(res, user, 200, `Welcome to Code Forge`);
});

const login = tryCatch(async(req, res, next) => {
  const {rollNumber, password} = req.body;
  if (!rollNumber || !password) {
      return next(new ErrorHandler("Please fill all the fields", 404));
  }

  const user = await User.findOne({ rollNumber }).select("+password");
  if(!user) return next(new ErrorHandler("Invalid credentials", 404));

  const isMatch = bcrypt.compare(password, user.password);
  if(!isMatch) return next(new ErrorHandler("Invalid credentials", 404));

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

export { newUser, login, forgetPassword, setNewPassword, getMyProfile, logOut, emailVerification, confirmOTP,uploadUserPhoto, resizeUserPhoto }