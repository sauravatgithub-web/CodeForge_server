import express from 'express'
import {
    getAllSubmission, 
    getThisSubmission, 
    createSubmission
} from '../controller/submissionController.js'

const router = express.Router();

router.get('/getSubmission', getAllSubmission);
router.get('/:name', getThisSubmission);
router.post('/createSubmission',createSubmission);

export default router;