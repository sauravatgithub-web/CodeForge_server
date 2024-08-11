import express from 'express'
import {
    getAllLabs, 
    getThisLab, 
    createLab,
    updateLab,
    startLab,
    extendLab,
    labQuestionSubmission,
    createReport,
} from '../controller/labController.js'

const router = express.Router();

router.get('/getAllLabs', getAllLabs);
router.get('/:batch', getThisLab);
router.post('/createLab', createLab);
router.post('/updateLab', updateLab);
router.post('/startLab/:labId',startLab);
router.post('/extendLab/:labId',extendLab);
router.post('/submitCode/:id', labQuestionSubmission);
router.post('/createReport/:id', createReport);

export default router;