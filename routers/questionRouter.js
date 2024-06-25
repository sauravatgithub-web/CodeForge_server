import express from 'express'
import {
    getAllQuestions,
    getThisOne,
    runCode,
    submitCode
} from '../controller/questionController.js'

const router = express.Router();

router.get('/getQuestions', getAllQuestions);
router.get('/:id', getThisOne);
router.post('/runCode/:id', runCode);
router.post('/submitCode/:id', submitCode);

export default router;