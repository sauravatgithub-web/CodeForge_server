import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import { cookieOption, sendToken } from '../utils/features.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const newUser = tryCatch(async (req, res, next) => {
  const {name, email, role, password} = req.body;

  const file = req.file;
  if(file) {
    // code to store photo
  }

  const user = await User.create({
      name,
      email,
      role,
      password,
      avatar,
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

export { newUser, login, getMyProfile, logOut }
  