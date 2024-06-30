import express from 'express'
import {
    getAllLabs, 
    getThisLab, 
    createLab
} from '../controller/labController.js'

const router = express.Router();

router.get('/getAllLabs', getAllLabs);
router.get('/:batch', getThisLab);
router.post('/createLab',createLab);

export default router;