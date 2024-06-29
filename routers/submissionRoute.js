import express from 'express'
import {
    getAllSubmission, 
    getThisOne, 
    createThisOne
} from '../controller/submissionController.js'

const router = express.Router();

router.get('/getSubmission', getAllSubmission);
router.get('/:name', getThisOne);
router.post('/createSubmission',createThisOne);

export default router;