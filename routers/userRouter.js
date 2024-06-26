import express from 'express'
import {
    emailVerification,
    newUser,
    login,
    getMyProfile,
    logOut,
    uploadUserPhoto,
    resizeUserPhoto
} from '../controller/userController.js'
import { isAuthenticated } from '../middlewares/auth.js';
import { emailValidator, otpValidator, validate } from '../lib/validator.js';

const router = express.Router();

router.post('/verifyOTP', otpValidator(), validate, confirmOTP);

// user must not be logged in
router.post('/verifyEmail', emailValidator(), validate, emailVerification);
router.post('/new', uploadUserPhoto, resizeUserPhoto, newUser);
router.post('/login', login);

// user must be logged in
router.use(isAuthenticated); 
router.get("/me", getMyProfile);
router.get("/logOut", logOut);

export default router;