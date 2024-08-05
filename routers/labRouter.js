import express from 'express'
import {
    getAllLabs, 
    getThisLab, 
    createLab,
    updateLab,
    startLab,
} from '../controller/labController.js'

const router = express.Router();

router.get('/getAllLabs', getAllLabs);
router.get('/:batch', getThisLab);
router.post('/createLab', createLab);
router.post('/updateLab', updateLab);
router.post('/startLab/:labId',startLab);

export default router;