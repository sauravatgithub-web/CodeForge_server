import express from 'express'
import {
    newUser,
    login,
    getMyProfile,
    logOut
} from '../controller/userController.js'
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// user must not be logged in
router.post('/new', newUser);
router.post('/login', login);

// user must be logged in
router.use(isAuthenticated); 
router.get("/me", getMyProfile);
router.get("/logOut", logOut);

export default router;