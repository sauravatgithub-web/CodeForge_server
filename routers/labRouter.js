import express from 'express'
import {
    getAllLabs, 
    getThisLab, 
    createLab,
    updateLab
} from '../controller/labController.js'

const router = express.Router();

router.get('/getAllLabs', getAllLabs);
router.get('/:batch', getThisLab);
router.post('/createLab', createLab);
router.post('/updateLab', updateLab);

export default router;