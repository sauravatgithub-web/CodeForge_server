import { body, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const validate = (req, res, next) => {
    const errors = validationResult(req);
    const errorMsg = errors.array().map((error) => error.msg).join(", ");
    
    if(errors.isEmpty()) return next();
    else next(new ErrorHandler(errorMsg, 400))
}

const emailValidator = () => [
    body("email", "Please enter a valid email id").notEmpty().isEmail(),
    body("email").custom((value) => {
        if (!value.endsWith("@iitbbs.ac.in")) {
            throw new Error("Please enter your institute email id");
        }
        return true;
    })
];

const otpValidator = () => [
    body("otp")
        .notEmpty().withMessage("Please enter the OTP sent to you email id")
        .isLength({min: 6, max: 6}).withMessage("OTP must be 6 digits long")
]

const registerValidator = () => [
    body("name", "Please enter name").notEmpty(),
    body("username", "Please enter username").notEmpty(),
    body("bio", "Please enter bio").notEmpty(),
    body("password", "Please enter password").notEmpty(),
];

const loginValidator = () => [
    body("username", "Please enter username").notEmpty(),
    body("password", "Please enter password").notEmpty(),
];

export {
    loginValidator,
    otpValidator,
    emailValidator,
    registerValidator, 
    validate 
}